const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')
const configs = require('./configs')
const { Mutex } = require('async-mutex')

/** @typedef {sqlite.Database} Database */
/** @type {sqlite.Database} */
let DB
let popMutex = new Mutex()

process.on('exit', () => { if (DB) DB.close() })
process.on('SIGHUP', () => process.exit(128 + 1))
process.on('SIGINT', () => process.exit(128 + 2))
process.on('SIGTERM', () => process.exit(128 + 15))

async function sourceMod(o) {
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

async function sourcePop() {
    let release = await popMutex.acquire()

    let source = await DB.get(`SELECT * FROM source WHERE last_fetch < ${Date.now() - configs.fetcher_interval} ORDER BY last_fetch LIMIT 1`)
    if (source) await DB.run(`UPDATE source SET last_fetch = ${Date.now()} WHERE source_id = ${source.source_id}`)

    release()
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
        sources: async (o = {}) => await DB.all(`SELECT * FROM ${o.expanded ? 'source_expanded' : 'source'}`),
        sourcesAdd: async o => (await DB.run('INSERT INTO source ( xml_url, title, description, html_url, lang, tag ) VALUES( ?, ?, ?, ?, ?, ? )', [o.xml_url, o.title, o.description, o.html_url, o.lang, o.tag])).lastID,
        sourcesDel: async source_id => (await DB.run('DELETE FROM source WHERE source_id = ?', [source_id])).changes,
        sourceMod,
        sourcePop,

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