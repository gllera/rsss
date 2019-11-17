const { db, initDB } = require('./db')
const { fetcher, initFetcher} = require('./fetcher')
const processor = require('./processor')

async function init() {
    await initDB()
    await initFetcher()
}

module.exports = { db, init, fetcher, processor }