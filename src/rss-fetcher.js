const debug = require('debug')('rsss:fetcher')
const _ = require('loadsh')
const async = require('async')

const { parseRSS, configs, db, processFeed } = require('./utils')

async function fetch(fetcher_interval) {
    let source = (await db.sources())
        .find(e => e.last_fetch < Date.now() - fetcher_interval)

    if (!source) return

    debug(`${source.source_id} PARSING`)

    await db.sourceMod({
        source_id: source.source_id,
        last_fetch: Date.now(),
    })

    try {
        let passed, feeds = await parseRSS(source.xml_url)

        if (!Array.isArray(feeds))
            throw new Error('Invalid feed')
        if (!feeds.length)
            return

        let last_guid = feeds[0].guid
        feeds = feeds.filter(e => !(passed = passed || e.guid == source.last_guid))

        await async.eachSeries(feeds, async feed => {
            if (!await db.feedExists(e.guid)) {
                feed.source_id = source.source_id
                feed.date = new Date(feed.date).getTime() || Date.now()

                feed = await processFeed(feed)
                await db.feedAdd(feed)
            }
        })

        await db.sourceMod({
            source_id: source.source_id,
            last_guid,
            err: null
        })

        debug(`${source.source_id} DONE`)
    }
    catch (e) {
        debug(`${source.source_id} ${e}`)

        await db.sourceMod({
            source_id: source.source_id,
            err: e.message || e
        })
    }
}

module.exports = () => setInterval(() => fetch(configs.fetcher_interval), configs.fetcher_sleep)