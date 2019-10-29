const { db, initDB } = require('./db')
const { fetcher, initFetcher} = require('./fetcher')
const procesor = require('./procesor')

async function init() {
    await initDB()
    await initFetcher()
}

module.exports = { db, init, fetcher, procesor }