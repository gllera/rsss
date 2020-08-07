const debug = require('debug')('rsss:fetcher')
const _ = require('loadsh')
const async = require('async')

const { parseRSS, configs, db, tuneFeed } = require('./libs')
let last_guid = {}

async function fetch(source) {
    debug(`${source.source_id} PARSING`)
    let err

    try {
        let feeds = await parseRSS(source.xml_url)

        if (!Array.isArray(feeds))
            throw new Error('Invalid feed')
        if (!feeds.length)
            return

        let passed, current_last_guid = last_guid[source.source_id]
        last_guid[source.source_id] = feeds[0].guid

        feeds = feeds.filter(e => !(passed = passed || e.guid == current_last_guid))

        await async.eachSeries(feeds, async feed => {
            if (!await db.feedExists(feed.guid)) {
                feed.source_id = source.source_id
                feed.date = new Date(feed.date).getTime() || Date.now()

                await tuneFeed(source.tuners, feed)
                await db.feedAdd(feed)
            }
        })

        debug(`${source.source_id} DONE`)
        err = null
    }
    catch (e) {
        debug(`${source.source_id} ${e}`)
        err = e.message || e
    }

    await db.sourceMod({
        source_id: source.source_id,
        err
    })
}

async function tick() {
    let source = await db.sourcePop()
    if (source) fetch(source)
}

module.exports = () => setInterval(tick, configs.fetcher_sleep)