const { parseSyncInfo, db } = require('./libs')

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

const async = require('async')
const { parseSyncInfo, db } = require('./libs')
const debug = require('debug')('rsss:source')

async function sources(o) {
    return await db.sources(o)
}

async function sourceAdd(_, { o }) {
    o.source_id = await db.sourcesAdd(o)
    return o
}

async function mutSources(_, { s }) {
    await db.feedModBulk(parseSyncInfo(s))
    return await sources()
}

module.exports = {
    Query: {
        sources,
        feeds,
    },
    Mutation: {
        feedMod,
        feeds: mutFeeds,
        sourceAdd,
        sourceDel: async (_, { source_id }) => await db.sourcesDel(source_id),
        sourceMod: async (_, { o }) => await db.sourceMod(o),
        sources: mutSources,
    }
}


async function Source(_, { o }) {
    if (o.source_id < 0)
        await db.del_source(parseSyncInfo(s))
    return await sources()
}

module.exports = {
    Mutation: {
        Sync,
        Feed,
        Source
    }
}