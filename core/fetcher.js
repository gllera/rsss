const Parser = require('rss-parser')
const EventEmitter = require('events')
const async = require('async')
const debug = require('debug')('rsss:fetcher')
const _ = require('loadsh')
const process = require('./procesor')

const defaults = {
    interval: 15 * 60 * 1000, // 15min
    timeout: 5 * 1000,
    agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
}

class Feed {
    constructor(id, url, parser) {
        this._id = id
        this._url = url
        this._parser = parser
        this._last = null
        this._error = null
    }

    async fetch() {
        let sol = []

        try {
            let res = await this._parser.parseURL(this._url)

            if (!Array.isArray(res.items))
                throw new Error('Invalid feed')

            for (let i = 0; i < res.items.length; i++) {
                if (res.items[i].guid == this._last)
                    break

                res.items[i].feedID = this._id
                sol.push(res.items[i])
            }

            this._error = null

            if (res.items.length)
                this._last = res.items[0].guid

            return sol

        } catch (e) {
            this._error = e
            debug(e)
        }

        return sol
    }
}

class Fetcher {
    constructor(opts) {
        _.defaults(opts, defaults)

        this._parser = new Parser({
            timeout: opts.timeout,
            headers: {
                'User-Agent': opts.agent
            }
        })

        this._interval = opts.interval
        this._timer = null
        this._working = false
        this._again = false
        this._feeds = []
    }

    add(id, url) {
        this._feeds.push(new Feed(id, url))
    }

    del(id) {
        _.pull(this._feeds, url)
    }

    async parse() {
        debug('Parsing...')

        if (this._working) {
            this._again = true
            return
        }

        clearTimeout(this._timer)

        this._working = true
        await async.eachLimit(this._feeds, 10, async feed => {
            try {
                let res = await feed.fetch()
                res.forEach(e => process(e))
            } catch (e) {
                debug(e)
            }
        })
        this._working = false

        if (this._again) {
            this._again = false
            await this.parse()
        }

        this._timer = setTimeout(() => this.parse(), this._interval)
    }
}

module.exports = (opts) => new Fetcher(opts)
