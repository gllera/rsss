const async = require('async')
const { parseSyncInfo, db } = require('../utils')
const debug = require('debug')('rsss:source')

async function sources() {
    let srcs = await db.sources()
    let status = fetcher.status()

    srcs.forEach(e => e.err = status[e.source_id])

    return srcs
}

async function sourceAdd(_, { o }) {
    o.source_id = await db.sourcesAdd(o)
    return o
}

async function mutSources(_, { s }) {
    await db.feedModBulk(parseSyncInfo(s))
    return await sources()
}

async function sourceAddBulk(_, { o }) {
    let values = []

    await async.eachSeries(o, async i => {
        try {
            i.source_id = await db.sourcesAdd(i)
            values.push(i)
        } catch (e) {
            i.err = e.message
            values.push(i)
        }
    })

    return values
}

module.exports = {
    Query: {
        sources,
    },
    Mutation: {
        sourceAdd,
        sourceDel: async (_, { source_id }) => await db.sourcesDel(source_id),
        sourceMod: async (_, { o }) => await db.sourceMod(o),
        sourceAddBulk,
        sources: mutSources,
    }
}