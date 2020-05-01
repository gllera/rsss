const configs = require('./configs')
const parseOPML = require('./opml-parser')
const parseRSS = require('./rss-parser')
const { processFeed, initFeedProcessor } = require('./feed-processor')
const { db, initDB } = require('./db')

async function init() {
    await initDB(configs)
    await initFeedProcessor()
}

function parseSyncInfo(s) {
    const upd = {
        seen: [],
        unseen: [],
        star: [],
        unstar: []
    }

    if (s && s.seen)
        s.seen.forEach(e => {
            if (e > 0)
                upd.seen.push(e)
            else
                upd.unseen.push(-e)
        })

    if (s && s.star)
        s.star.forEach(e => {
            if (e > 0)
                upd.star.push(e)
            else
                upd.unstar.push(-e)
        })

    return upd
}

module.exports = {
    init,
    db,
    configs,
    parseSyncInfo,
    parseOPML,
    parseRSS,
    processFeed
}