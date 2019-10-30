const u = require('umbrellajs')
const db = require('../db')

const view = u('#feed')
const view_title = u('#title')
const view_content = u('#content')
const view_url = u('#url')

const _me = 'FEED'
let _on = false
let _feed_id = null

function visibility() {
    const on = db.currentView() == _me

    if (on != _on) {
        if (on)
            view.removeClass('d-none')
        else
            view.addClass('d-none')
    }

    return _on = on
}

function update() {
    if (!visibility())
        return

    const feed = db.currentFeed()

    if (feed) {
        if (_feed_id != feed.feed_id) {
            view_title.html(feed.title)
            view_content.html(feed.content)
            view_url.attr({ href: feed.url })

            _feed_id = feed.feed_id
        }
    }
    else if (_feed_id) {
        view_title.html('Not good..')
        view_content.html('Not good..')
        view_url.attr({ href: '' })

        _feed_id = null
    }
}

module.exports = {
    update
}