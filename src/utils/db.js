const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')
const configs = require('./configs')

/** @typedef {sqlite.Database} Database */
/** @type {sqlite.Database} */
let DB

process.on('exit', () => { if (DB) DB.close() })
process.on('SIGHUP', () => process.exit(128 + 1))
process.on('SIGINT', () => process.exit(128 + 2))
process.on('SIGTERM', () => process.exit(128 + 15))

const sourcesQuery = `
SELECT 
    s.*,
    COUNT(f1.source_id) AS 'count',
    COUNT(f2.source_id) AS 'unseen',
    COUNT(f3.source_id) AS 'stars'
FROM 
    source AS s
        LEFT JOIN feed AS f1
            ON s.source_id = f1.source_id
        LEFT JOIN feed AS f2
            ON f1.feed_id = f2.feed_id AND f2.seen = 0
        LEFT JOIN feed AS f3
            ON f1.feed_id = f3.feed_id AND f3.star = 1
GROUP BY s.source_id
`

async function sourceMod(o) {
    let query = [], values = []
    const keys = ['xml_url', 'title', 'description', 'html_url', 'lang', 'tag']

    keys.forEach(i => {
        if (o[i] !== undefined) {
            query.push(`${i} = ?`)
            values.push(o[i])
        }
    })

    if (!query.length)
        return 0

    values.push(o.source_id)

    return (await DB.run(`UPDATE source SET ${query.join(',')} WHERE source_id = ?`, values)).changes
}

async function feedMod(o) {
    let query = [], values = []
    const keys = ['seen', 'star']

    keys.forEach(i => {
        if (o[i] !== undefined) {
            query.push(`${i} = ?`)
            values.push(o[i])
        }
    })

    if (!query.length)
        return 0

    values.push(o.feed_id)

    return (await DB.run(`UPDATE feed SET ${query.join(',')} WHERE feed_id = ?`, values)).changes
}

async function feedModBulk(o) {
    const rk = ['seen', 'unseen', 'star', 'unstar']
    const colum = ['seen', 'star']

    for (let i = 0; i < rk.length; i++) {
        const arr = o[rk[i]]
        const k = colum[parseInt(i / 2)]
        const v = (i + 1) % 2

        if (arr.length)
            await DB.run(`UPDATE feed SET ${k} = ${v} WHERE feed_id in (${arr.join(',')})`)
    }
}

async function feeds(o) {
    let query = [], values = [], where = ''
    const keys = ['feed_id', 'source_id', 'seen', 'star', 'tag']

    if (o) {
        keys.forEach(i => {
            if (o[i] !== undefined) {
                query.push(`${i == 'tag' ? 's' : 'f'}.${i} = ?`)
                values.push(o[i])
            }
        })

        if (o['exclude'] !== undefined && o['exclude'].length)
            query.push(`f.feed_id NOT IN (${o['exclude'].join(',')})`)
    }

    if (query.length)
        where = `WHERE ${query.join(' AND ')}`

    const order = (o && o.asc) ? 'ASC' : 'DESC'
    values.push((o && o.limit) ? o.limit : 50)

    return await DB.all(`SELECT f.* FROM feed as f LEFT JOIN source AS s ON f.source_id = s.source_id ${where} ORDER BY f.date ${order} LIMIT ?`, values)
}


this._lastFetch = 0
this._lastGuid = null
this._err = null

function status() {
    let res = {}
    sources.forEach(e => {
        if (e._err !== null)
            res[e._source_id] = e._err
    })
    return res
}

module.exports = {
    db: {
        sources: async () => await DB.all(sourcesQuery),
        sourcesAdd: async o => (await DB.run('INSERT INTO source ( xml_url, title, description, html_url, lang, tag ) VALUES( ?, ?, ?, ?, ?, ? )', [o.xml_url, o.title, o.description, o.html_url, o.lang, o.tag])).lastID,
        sourcesDel: async source_id => (await DB.run('DELETE FROM source WHERE source_id = ?', [source_id])).changes,
        sourceMod,

        feeds,
        feedAdd: async o => await DB.run('INSERT INTO feed ( guid, link, title, content, date, source_id ) VALUES( ?, ?, ?, ?, ?, ? )', [o.guid, o.link, o.title, o.content, o.date, o.source_id]),
        feedMod,
        feedModBulk,
        feedExists: async guid => await DB.get('SELECT * FROM feed WHERE guid = ?', [guid]) !== undefined,
    },
    initDB: async () => {
        DB = await sqlite.open({
            filename: 'data/' + configs.db_name,
            driver: sqlite3.cached.Database
        })

        await DB.migrate({ force: configs.db_force })
        await DB.get("PRAGMA foreign_keys = ON")
    },
}