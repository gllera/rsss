import async from 'async'
import fs from 'fs'
import path from 'path'
import Debug from 'debug'
import { JSDOM } from 'jsdom'

import { db } from './db.js'
import configs from './libs/configs.js'
import parseRSS from './libs/rss_parser.js'

const debug = Debug('rsss:fetcher')

let last_guid = {}
const tuners = {}, tunersStrOrder = {}
const sorter = (a, b) => (a.z === undefined ? 99 : a.z) - (b.z === undefined ? 99 : b.z)

function includePath(folder) {
    fs.readdirSync(folder).forEach(async i => {
        const full_path = path.resolve(folder, i)
        const name = path.parse(full_path).name

        tuners[name] = (await import(full_path)).default

        if (typeof tuners[name] !== "function")
            throw (`Invalid tuner file: ${full_path}`)

        debug('Found', full_path)
    })
}

function parse_tuners(tuners_str) {
    const res = {}

    for (let i of tuners_str.split('<%>')) {
        i = i.replace(/\r?\n|\r/g, ' ').replace(/\s+/g,' ')
        let pos_idx = i.indexOf('-')
        let pos_val = i.indexOf(':')

        pos_idx = pos_idx == -1 ? i.length : pos_idx
        pos_val = pos_val == -1 ? i.length : pos_val

        let idx = parseInt(i.substring(0, pos_idx).trim())
        let name = i.substring(pos_idx + 1, pos_val).trim()
        let param = i.substring(pos_val + 1).trim()

        if (!isNaN(idx)) {
            if (!res.hasOwnProperty(idx))
                res[idx] = []

            if (name)
                res[idx].push({ name, param })
        }
    }

    return res
}

async function tuneFeed(tunersStr, feed) {
    tunersStr = tunersStr || ""
    let order = tunersStrOrder[tunersStr]

    if (order === undefined) {
        order = tunersStrOrder[tunersStr] = []

        const tmp = {
            ...parse_tuners(configs.tuners_default),
            ...parse_tuners(tunersStr)
        }

        for (const i of Object.keys(tmp).sort())
            for (const j of tmp[i])
                order.push(j)
    }

    for (const e of order) {
        debug(feed.source_id, e.name)
        await tuners[e.name](feed, e.param)
    }
}

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
                feed.source_id = source.source_id
                feed.date = new Date(feed.date).getTime() || Date.now()
                feed.doc = new JSDOM(feed.raw, { url: feed.link }).window.document

                await tuneFeed(source.tuners, feed)
                feed.content = feed.doc.body.innerHTML
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

    await db.sources.mod({
        source_id: source.source_id,
        err
    })
}

export function initFetching() {
    includePath('src/tuners')

    if (fs.existsSync('data/tuners'))
        includePath('data/tuners')
}

export function startFetching() {
    setInterval(async () => {
        let source = await db.sources.pop()
        if (source) fetch(source)
    }, configs.fetcher_sleep)
} 