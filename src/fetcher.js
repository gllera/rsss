import async from 'async'
import Debug from 'debug'
import { JSDOM } from 'jsdom'

import { db } from './db.js'
import { tune } from './tuner.js'
import configs from './libs/configs.js'
import parseRSS from './libs/rss_parser.js'

const debug = Debug('rsss:fetcher')

let last_guid = {}

async function fetch(source) {
    debug(source.source_id, 'PARSING')
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
            if (!await db.feeds.old(feed.guid)) {
                debug(source.source_id, `Tuning ${feed.guid}`)

                feed.source_id = source.source_id
                feed.date = new Date(feed.date).getTime() || Date.now()
                feed.doc = new JSDOM(feed.raw, { url: feed.link }).window.document

                await tune(feed, source.tuners)
                feed.content = feed.doc.body.innerHTML

                Object.keys(feed)
                    .filter(key => !db.feeds.columns.includes(key))
                    .forEach(key => delete feed[key]);

                await db.feeds.add(feed)
            }
        })

        debug(source.source_id, 'DONE')
        err = null
    }
    catch (e) {
        debug(source.source_id, e)
        err = e.message || e
    }

    await db.sources.mod(source.source_id, { err })
}

export function startFetching() {
    setInterval(async () => {
        let source = await db.sources.pop()
        if (source) fetch(source)
    }, configs.fetcher_sleep)
} 