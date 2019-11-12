const debug = require('debug')('rsss:fetcher')
const _ = require('loadsh')
const async = require('async')
const { Parse, configs } = require('../utils')
const { db } = require('./db')
const processor = require('./processor')
const fields = ['title', 'content', 'url', 'date', 'guid', 'source_id']

let sources = []
setInterval(() => fetch(), configs.FETCHER_SLEEP)

class Feed {
    constructor(source_id, url) {
        this._lastGuid = null
        this._source_id = source_id
        this._url = url
        this._lastFetch = 0
        this._err = null
    }

    async fetch() {
        debug(`${this._source_id} PARSING`)

        try {
            this._lastFetch = Date.now()
            let res = await Parse(this._url)

            if (!Array.isArray(res.items))
                throw new Error('Invalid feed')
            if (!res.items.length)
                return

            let passed
            const lastGuid = res.items[0].guid

            res = res.items.filter(e => {
                e.guid = e.guid || e.url
                return !(passed = passed || e.guid == this._lastGuid)
            })

            await async.eachSeries(res, async e => {
                if (!await db.feedExists(e.guid)) {
                    e.source_id = this._source_id
                    e.date = new Date(e.isoDate).getTime() || Date.now()
                    e.url = e.link
                    e = _.pick(e, fields)

                    e = await processor(e)
                    await db.feedAdd(e)
                }
            })

            this._err = null
            this._lastGuid = lastGuid

            debug(`${this._source_id} DONE`)
        }
        catch (e) {
            debug(`${this._source_id} ${e}`)
            this._err = e.message
        }
    }
}

function fetch() {
    for (let i = sources.length - 1; i >= 0; i--)
        if (sources[i]._lastFetch < Date.now() - configs.FETCHER_INTERVAL) {
            sources[i].fetch()
            return
        }
}

async function initFetcher() {
    let res = await db.sources()
    res.forEach(e => sources.push(new Feed(e.source_id, e.url)))
}


function status() {
    let res = {}
    sources.forEach(e => {
        if (e._err !== null)
            res[e._source_id] = e._err
    })
    return res
}

module.exports = {
    initFetcher,
    fetcher: {
        sourceAdd: (e) => sources.push(new Feed(e.source_id, e.url)),
        sourceDel: (source_id) => sources = sources.filter(e => e._source_id != source_id),
        status,
    },
}
