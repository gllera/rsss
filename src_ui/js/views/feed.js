const u = require('umbrellajs')
const { db, visibility } = require('../utils')
const ctrl = require('../controller')

const view = u('#feed')
const view_title = u('#title')
const view_content = u('#content')
const view_url = u('#url')

const state = {
    me: 'FEED',
    on: false,
}

let _feed_id = null

function update() {
    if (!visibility(state, view))
        return

    const feed = db.currentFeed()

    if (feed) {
        db.feedMod('seen', 1)

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
    update,
    me: () => state.me,
}