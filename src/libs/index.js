export * as configs from './configs.js'
export * as parseOPML from './opml-parser.js'
export * as parseRSS from './rss-parser.js'
export { tuneFeed } from './feed-tuner.js'
export { db } from './db.js'

import configs from './configs.js'
import { initFeedTuner } from './feed-tuner.js'
import { initDB } from './db.js'

export async function init() {
    await initDB(configs)
    await initFeedTuner()
}
