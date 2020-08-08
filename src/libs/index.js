const configs = require('./configs')
const parseOPML = require('./opml-parser')
const parseRSS = require('./rss-parser')
const { tuneFeed, initFeedTuner } = require('./feed-tuner')
const { db, initDB } = require('./db')

async function init() {
    await initDB(configs)
    await initFeedTuner()
}

module.exports = {
    init,
    db,
    configs,
    parseOPML,
    parseRSS,
    tuneFeed
}