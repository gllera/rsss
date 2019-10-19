const sqlite = require('sqlite')
const { configs } = require('../utils')

/** @typedef {sqlite.Database} Database */
let db

async function init(opts) {
    db = await sqlite.open(configs.db.path, { cached: configs.db.cached })
    await db.migrate({ force: configs.db.force })
    await db.get("PRAGMA foreign_keys = ON")

    return db
}

process.on('exit', () => { if (db) db.close() })
process.on('SIGHUP', () => process.exit(128 + 1))
process.on('SIGINT', () => process.exit(128 + 2))
process.on('SIGTERM', () => process.exit(128 + 15))

module.exports = init