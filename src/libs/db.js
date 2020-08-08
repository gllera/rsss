const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')
const debug = require('debug')('rsss:db')
const configs = require('./configs')

/** @typedef {sqlite.Database} Database */
/** @type {sqlite.Database} */
let DB

const feeds_mod_values = [
    { col: 'seen', val: 1, key: 'set_seen' },
    { col: 'star', val: 1, key: 'set_star' },
    { col: 'seen', val: 0, key: 'set_unseen' },
    { col: 'star', val: 0, key: 'set_unstar' },
]

const source_mod_values = [
    { col: 'xml_url', key: 'xml_url' },
    { col: 'title', key: 'title' },
    { col: 'description', key: 'description' },
    { col: 'html_url', key: 'html_url' },
    { col: 'lang', key: 'lang' },
    { col: 'tag', key: 'tag' },
    { col: 'err', key: 'err' },
    { col: 'last_fetch', key: 'last_fetch' },
]

const feeds_values = [
    { col: 'f.feed_id', key: 'flr_feed_id' },
    { col: 'f.source_id', key: 'flr_source_id' },
    { col: 'f.seen', key: 'flr_seen' },
    { col: 'f.star', key: 'flr_star' },
    { col: 's.tag', key: 'flr_tag' },
]

process.on('exit', () => { if (DB) DB.close() })
process.on('SIGHUP', () => process.exit(128 + 1))
process.on('SIGINT', () => process.exit(128 + 2))
process.on('SIGTERM', () => process.exit(128 + 15))

async function source_mod(o) {
    const query = [], values = []

    for (const e of source_mod_values)
        if (o[e.key] !== undefined) {
            query.push(`${e.col} = ?`)
            values.push(o[e.key])
        }

    if (!query.length)
        return 0

    values.push(o.source_id)

    return (await DB.run(`UPDATE source SET ${query.join(',')} WHERE source_id = ?`, values)).changes
}

async function source_pop() {
    const source = await DB.get('SELECT * FROM source WHERE last_fetch < ? ORDER BY last_fetch LIMIT 1', [Date.now() - configs.fetcher_interval])

    if (source)
        await DB.run('UPDATE source SET last_fetch = ? WHERE source_id = ?', [Date.now(), source.source_id])

    return source
}

async function feeds_mod(o) {
    for (const e of feeds_mod_values) {
        const arr = o[e.key]

        if (arr && arr.length)
            await DB.run(`UPDATE feed SET ${e.col} = ${e.val} WHERE feed_id in (${arr.join(',')})`)
    }
}

async function feeds(o) {
    const query = ['1'], values = []
    const order = o.flr_asc ? 'ASC' : 'DESC'

    for (const e of feeds_values)
        if (o[e.key] !== undefined) {
            query.push(`${e.col} = ?`)
            values.push(o[e.key])
        }

    if (o.flr_page_min !== undefined || o.flr_page_max !== undefined) {
        if (o.flr_page_min === undefined)
            o.flr_page_min = 0

        if (o.flr_page_max === undefined)
            o.flr_page_max = 2000000000

        query.push('( f.feed_id < ? OR f.feed_id > ? )')
        values.push(o.flr_page_min, o.flr_page_max)
    }

    values.push(o.flr_limit ? o.flr_limit : 50)

    return await DB.all(`SELECT f.* FROM feed as f LEFT JOIN source AS s ON f.source_id = s.source_id WHERE ${query.join(' AND ')} ORDER BY f.date ${order} LIMIT ?`, values)
}

module.exports = {
    db: {
        sources: {
            all: async () => await DB.all('SELECT * FROM source_view'),
            add: async o => (await DB.run('INSERT INTO source ( xml_url, title, description, html_url, lang, tag, tuners ) VALUES( ?, ?, ?, ?, ?, ?, ? )', [o.xml_url, o.title, o.description, o.html_url, o.lang, o.tag, o.tuners])).lastID,
            del: async id => (await DB.run('DELETE FROM source WHERE source_id = ?', [id])).changes,
            pop: source_pop,
            mod: source_mod
        },
        feeds: {
            all: feeds,
            old: async guid => await DB.get('SELECT * FROM feed WHERE guid = ?', [guid]) !== undefined,
            add: async o => await DB.run('INSERT INTO feed ( guid, link, title, content, date, source_id ) VALUES( ?, ?, ?, ?, ?, ? )', [o.guid, o.link, o.title, o.content, o.date, o.source_id]),
            mod: feeds_mod
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
