const sqlite = require('sqlite')
const { configs } = require('../utils')

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
    const keys = ['url', 'title', 'description', 'siteUrl', 'lang']

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

async function feeds(o) {
    let query = [], values = [], where = ''
    const keys = ['feed_id', 'source_id', 'seen', 'star']

    if (o)
        keys.forEach(i => {
            if (o[i] !== undefined) {
                query.push(`${i} = ?`)
                values.push(o[i])
            }
        })

    if (query.length)
        where = `WHERE ${query.join(' AND ')}`

    return await DB.all(`SELECT * FROM feed ${where}`, values)
}

module.exports = {
    db: {
        sources: async () => await DB.all(sourcesQuery),
        sourcesAdd: async (o) => (await DB.run('INSERT INTO source ( url, title, description, siteUrl, lang ) VALUES( ?, ?, ?, ?, ? )', [o.url, o.title, o.description, o.siteUrl, o.lang])).lastID,
        sourcesDel: async (source_id) => (await DB.run('DELETE FROM source WHERE source_id = ?', [source_id])).changes,
        sourceMod,

        feeds,
        feedAdd: async (o) => await DB.run('INSERT INTO feed ( guid, url, title, content, date, source_id ) VALUES( ?, ?, ?, ?, ?, ? )', [o.guid, o.url, o.title, o.content, o.date, o.source_id]),
        feedMod,
        feedExists: async (guid) => await DB.get('SELECT * FROM feed WHERE guid = ?', [guid]) !== undefined,
    },
    initDB: async () => {
        DB = await sqlite.open('data/' + configs.DB_NAME, { cached: configs.DB_CACHED })
        await DB.migrate({ force: configs.DB_FORCE })
        await DB.get("PRAGMA foreign_keys = ON")
    },
}