const async = require('async')
const { fetcher, db } = require('../core')
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
    return o.source_id
}

async function sourceDel(root, { source_id }) {
    fetcher.sourceDel(source_id)
    return await db.sourcesDel(source_id)
}

async function sourceMod(root, { o }) {
    return await db.sourcesMod(o)
}

async function sourceAddBulk(root, { o }) {
    let values = []

    await async.eachSeries(o, async i => {
        try {
            i.source_id = await db.sourcesAdd(i)
            fetcher.sourceAdd(i)
            values.push(i.source_id)
        } catch (e) {
            debug(e)
            values.push(-1)
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
    }
}