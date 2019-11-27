const async = require('async')
const { fetcher, db } = require('../core')
const { getSyncInfo } = require('../utils')
const debug = require('debug')('rsss:source')

async function sources() {
    let srcs = await db.sources()
    let status = fetcher.status()

    srcs.forEach(e => e.err = status[e.source_id])

    return srcs
}

async function sourceAdd(root, { o }) {
    o.source_id = await db.sourcesAdd(o)
    fetcher.sourceAdd(o)
    return o
}

async function sourceDel(root, { source_id }) {
    fetcher.sourceDel(source_id)
    return await db.sourcesDel(source_id)
}

async function mutSources(root, { s }) {
    await db.feedModBulk(getSyncInfo(s))
    return await sources()
}

async function sourceMod(root, { o }) {
    return await db.sourceMod(o)
}

async function sourceAddBulk(root, { o }) {
    let values = []

    await async.eachSeries(o, async i => {
        try {
            i.source_id = await db.sourcesAdd(i)
            fetcher.sourceAdd(i)
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
        sourceDel,
        sourceMod,
        sourceAddBulk,
        sources: mutSources,
    }
}