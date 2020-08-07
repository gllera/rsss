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

async function source_mod(o) {
    let query = [], values = []
    const keys = ['xml_url', 'title', 'description', 'html_url', 'lang', 'tag', 'err', 'last_fetch']

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

async function source_pop() {
    let source = await DB.get('SELECT * FROM source WHERE last_fetch < ? ORDER BY last_fetch LIMIT 1', [Date.now() - configs.fetcher_interval])

    if (source)
        await DB.run('UPDATE source SET last_fetch = ? WHERE source_id = ?', [Date.now(), source.source_id])

    return source
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

async function feeds(o = {}) {
    let query = [], values = [], where = ''
    const keys = ['feed_id', 'source_id', 'seen', 'star', 'tag']

    keys.forEach(i => {
        if (o[i] !== undefined) {
            query.push(`${i == 'tag' ? 's' : 'f'}.${i} = ?`)
            values.push(o[i])
        }
    })

    if (o['exclude'] !== undefined && o['exclude'].length)
        query.push(`f.feed_id NOT IN (${o['exclude'].join(',')})`)

    if (query.length)
        where = `WHERE ${query.join(' AND ')}`

    const order = (o && o.asc) ? 'ASC' : 'DESC'
    values.push((o && o.limit) ? o.limit : 50)

    return await DB.all(`SELECT f.* FROM feed as f LEFT JOIN source AS s ON f.source_id = s.source_id ${where} ORDER BY f.date ${order} LIMIT ?`, values)
}

module.exports = {
    db: {
        sources: {
            // all: async () => await DB.all('SELECT * FROM source_view'),
            add: async o => (await DB.run('INSERT INTO source ( xml_url, title, description, html_url, lang, tag, tuners ) VALUES( ?, ?, ?, ?, ?, ?, ? )', [o.xml_url, o.title, o.description, o.html_url, o.lang, o.tag, o.tuners])).lastID,
            del: async id => (await DB.run('DELETE FROM source WHERE source_id = ?', [id])).changes,
            pop: source_pop,
            mod: source_mod
        },
        feeds: {
            // all: feeds,
            old: async guid => await DB.get('SELECT * FROM feed WHERE guid = ?', [guid]) !== undefined,
            add: async o => await DB.run('INSERT INTO feed ( guid, link, title, content, date, source_id ) VALUES( ?, ?, ?, ?, ?, ? )', [o.guid, o.link, o.title, o.content, o.date, o.source_id]),
            // mod: feedModBulk,
        },
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