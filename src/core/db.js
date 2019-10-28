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
        JOIN feed AS f1
            ON s.source_id = f1.source_id
        LEFT JOIN feed AS f2
            ON f1.feed_id = f2.feed_id AND f2.seen = 0
        LEFT JOIN feed AS f3
            ON f1.feed_id = f3.feed_id AND f3.star = 1
GROUP BY s.source_id
`

module.exports = {
    db: {
        sources: async () => await DB.all(sourcesQuery),
        sourcesAdd: async (e) => await DB.run('INSERT INTO source ( url, title, description, siteUrl, lang ) VALUES( ?, ?, ?, ?, ? )', [e.url, e.title, e.description, e.siteUrl, e.lang]),
        sourcesDel: async (source_id) => await DB.run('DELETE FROM source WHERE source_id = ?', [source_id]),

        feedAdd: async (e) => await DB.run('INSERT INTO feed ( guid, url, title, content, date, source_id ) VALUES( ?, ?, ?, ?, ?, ? )', [e.guid, e.url, e.title, e.content, e.date, e.source_id]),
        feedExists: async (guid) => await DB.get('SELECT * FROM feed WHERE guid = ?', [guid]) !== undefined,
    },
    initDB: async () => {
        DB = await sqlite.open('data/' + configs.DB_NAME, { cached: configs.DB_CACHED })
        await DB.migrate({ force: configs.DB_FORCE })
        await DB.get("PRAGMA foreign_keys = ON")
    },
}