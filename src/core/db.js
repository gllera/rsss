const sqlite = require('sqlite')
const { configs } = require('../utils')

/** @typedef {sqlite.Database} Database */
let db

async function init(opts) {
    db = await sqlite.open('data/' + configs.DB_NAME, { cached: configs.DB_CACHED })
    await db.migrate({ force: configs.DB_FORCE })
    await db.get("PRAGMA foreign_keys = ON")

    return db
}

process.on('exit', () => { if (db) db.close() })
process.on('SIGHUP', () => process.exit(128 + 1))
process.on('SIGINT', () => process.exit(128 + 2))
process.on('SIGTERM', () => process.exit(128 + 15))

module.exports = init