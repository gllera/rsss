const sqlite = require('sqlite')
const { configs } = require('../utils')

/** @typedef {sqlite.Database} Database */
/** @type {sqlite.Database} */
let DB

process.on('exit', () => { if (DB) DB.close() })
process.on('SIGHUP', () => process.exit(128 + 1))
process.on('SIGINT', () => process.exit(128 + 2))
process.on('SIGTERM', () => process.exit(128 + 15))

module.exports = {
    db: {
        sources: async () => await DB.all('SELECT * FROM source'),

        feedAdd: async (e) => await DB.run('INSERT INTO feed ( guid, url, title, content, date, source_id ) VALUES( ?, ?, ?, ?, ?, ? )', [e.guid, e.url, e.title, e.content, e.date, e.source_id]),
        feedExists: async (guid) => await DB.get('SELECT * FROM feed WHERE guid = ?', [guid]) !== undefined,
    },
    initDB: async () => {
        DB = await sqlite.open('data/' + configs.DB_NAME, { cached: configs.DB_CACHED })
        await DB.migrate({ force: configs.DB_FORCE })
        await DB.get("PRAGMA foreign_keys = ON")
    },
}