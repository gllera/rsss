let u = require('umbrellajs')
const utils = require('./utils')

const defFilterOpts = {
    order: -1,
    source_id: -1,
}

class FeedView {
    constructor() {
        this._idx = -1
        this._feed_id = -1
        this._feeds = []
        this._feedsFiltered = []
        this._filterOpts = {
            order: defFilterOpts.order,
            source_id: defFilterOpts.source_id,
        }
        this._view = u('#feed')
        this._content = u('#content')
        this._title = u('#title')
        this._url = u('#url')
    }

    _set() {
        if (this._idx < 0)
            this._idx = 0

        if (this._idx >= this._feedsFiltered.length)
            this._idx = this._feedsFiltered.length - 1

        if (this._idx < 0) {
            this._title.html('Not good..')
            this._content.html('Not good..')
            this._url.attr({ href: '' })
            this._feed_id = -1
            return
        }

        let feed = this._feedsFiltered[this._idx]

        if (this._feed_id != feed.feed_id) {
            this._feed_id = feed.feed_id

            this._title.html(feed.title)
            this._content.html(feed.content)
            this._url.attr({ href: feed.url })
        }
    }

    show() {
        this._view.removeClass('d-none')
    }

    hide() {
        this._view.addClass('d-none')
    }

    filter(opts = {}) {
        opts = utils.defaults(opts, this._filterOpts)
        this._feedsFiltered = []

        this._feeds.forEach(e => {
            if (e.source_id == opts.source_id)
                this._feedsFiltered.push(e)
        })

        this._idx = -1
        this._set()
    }

    update(feeds, err) {
        if (err) {
            console.log(err)
            this._feeds = []
            this._set()
            return
        }

        this._feeds = feeds
        this._idx = -1

        for (let idx in feeds)
            if (feeds[idx].feed_id == this._feed_id) {
                this._idx = idx
                break
            }

        this._set()
    }

    currentFeedId() {
        return this._feed_id
    }

    next() {
        this._idx++
        this._set()
    }

    prev() {
        this._idx--
        this._set()
    }
}

module.exports = () => new FeedView()