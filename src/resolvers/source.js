const async = require('async')
const { fetcher, db } = require('../core')
const { xmlStreamToJs } = require('../utils')
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

async function sync(root, { o }) {
    if (o) {
        const upd = {
            seen: [],
            unseen: [],
            star: [],
            unstar: []
        }

        if (o.seen)
            o.seen.forEach(e => {
                if (e > 0)
                    upd.seen.push(e)
                else
                    upd.unseen.push(-e)
            })

        if (o.star)
            o.star.forEach(e => {
                if (e > 0)
                    upd.star.push(e)
                else
                    upd.unstar.push(-e)
            })

        await db.feedModBulk(upd)
    }
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

function parseJsImport(o, res) {
    if (o.$ && o.$.type == 'rss')
        if (res[o.$.xmlUrl] === undefined)
            res[o.$.xmlUrl] = {
                title: o.$.title,
                url: o.$.xmlUrl,
                siteUrl: o.$.htmlUrl,
            }

    if (Array.isArray(o.outline))
        o.outline.forEach(e => parseJsImport(e, res))
}

async function sourcesImport(root, { file }) {
    const { filename, mimetype, createReadStream } = await file
    const txt = await xmlStreamToJs(createReadStream())

    const RSSs = {}
    const res = []

    if (txt && txt.opml && Array.isArray(txt.opml.body))
        txt.opml.body.forEach(e => parseJsImport(e, RSSs))

    for (let e in RSSs)
        res.push(RSSs[e])

    return sourceAddBulk(root, { o: res })
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
        sourcesImport,
        sync,
    }
}