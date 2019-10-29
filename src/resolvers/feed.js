const { db } = require('../core')

async function feeds(root, { o }) {
    return await db.feeds(o)
}

async function feedMod(root, { o }) {
    return await db.feedMod(o)
}

module.exports = {
    Query: {
        feeds
    },
    Mutation: {
        feedMod
    }
}