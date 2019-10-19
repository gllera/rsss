const EventEmitter = require('events')
const async = require('async')
const debug = require('debug')('rsss:fetcher')
const _ = require('loadsh')
const { Parse, configs } = require('../utils')

const fields = ['title', 'content', 'link', 'date', 'guid', 'source_id']

/** @typedef {Fetcher} Fetcher */

class Feed {
    constructor(fetcher, source_id, url, source) {
        this._fetcher = fetcher
        this._lastGuid = null
        this._source_id = source_id
        this._url = url

        setImmediate(() => {
            this._timer = setInterval(() => this.fetch(), fetcher.interval)
            this.fetch(source)
        }, this)
    }

    async fetch(source) {
        debug(`${this._source_id} PARSING`)

        try {
            let res = source ? source : await Parse(this._url)

            if (!Array.isArray(res.items))
                throw new Error('Invalid feed')
            if (!res.items.length)
                return

            let passed

            res.items
                .filter(e => {
                    e.guid = e.guid || e.link
                    return !(passed = passed || e.guid == this._lastGuid)
                })
                .forEach(e => {
                    e.source_id = this._source_id
                    e.date = new Date(e.isoDate).getTime()
                    this._fetcher.emit('feed', this._fetcher.procesor(_.pick(e, fields)))
                })

            this._fetcher.emit('feed', null, { source_id: this._source_id, msg: "[OK]" })
            this._lastGuid = res.items[0].guid

            debug(`${this._source_id} DONE`)
        }
        catch (e) {
            debug(`${this._source_id} ${e}`)
            this._fetcher.emit('feed', null, { source_id: this._source_id, msg: e.message })
        }
    }

    kill() {
        clearTimeout(this._timer)
    }
}

class Fetcher extends EventEmitter {
    constructor(procesor) {
        super()
        this.procesor = procesor
        this.interval = configs.fetcher.interval
        this._sources = []
    }

    addSource(source_id, url, source) {
        this._sources.push(new Feed(this, source_id, url, source))
    }
    delSource(source_id) {
        for (let i in this._sources)
            if (this._sources[i]._id == source_id) {
                this._sources.splice(i, 1)
                return
            }
    }
}

function init(procesor) {
    return new Fetcher(procesor)
}

module.exports = init
