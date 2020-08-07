const { parseSyncInfo, db } = require('../libs')

async function feeds(root, { o }) {
    return await db.feeds(o)
}

async function feedMod(root, { o }) {
    return await db.feedMod(o)
}

async function mutFeeds(root, { o, s }) {
    await db.feedModBulk(parseSyncInfo(s))
    return await feeds(root, { o })
}

module.exports = {
    Query: {
        feeds,
    },
    Mutation: {
        feedMod,
        feeds: mutFeeds,
    }
}