const debug = require('debug')('rsss:fetcher')
const _ = require('loadsh')
const async = require('async')
const { parseRSS, configs } = require('../utils')
const { db } = require('./db')
const processor = require('./processor')

let sources = []
setInterval(() => fetch(), configs.fetcher_sleep)

class Feed {
    constructor(source_id, xml_url) {
        this._lastGuid = null
        this._source_id = source_id
        this._xml_url = xml_url
        this._lastFetch = 0
        this._err = null
    }

    async fetch() {
        debug(`${this._source_id} PARSING`)

        try {
            this._lastFetch = Date.now()
            let res = await parseRSS(this._xml_url)

            if (!Array.isArray(res))
                throw new Error('Invalid feed')
            if (!res.length)
                return

            let passed
            const lastGuid = res[0].guid

            res = res.filter(e => !(passed = passed || e.guid == this._lastGuid))

            await async.eachSeries(res, async e => {
                if (!await db.feedExists(e.guid)) {
                    e.source_id = this._source_id
                    e.date = new Date(e.date).getTime() || Date.now()

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
            this._err = e.message || e
        }
    }
}

function fetch() {
    for (let i = sources.length - 1; i >= 0; i--)
        if (sources[i]._lastFetch < Date.now() - configs.fetcher_interval) {
            sources[i].fetch()
            return
        }
}

async function initFetcher() {
    let res = await db.sources()
    res.forEach(e => sources.push(new Feed(e.source_id, e.xml_url)))
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
        sourceAdd: (e) => sources.push(new Feed(e.source_id, e.xml_url)),
        sourceDel: (source_id) => sources = sources.filter(e => e._source_id != source_id),
        status,
    },
}
