const $ = require('cash-dom')
const { model, visibility } = require('../utils')

const view = $('.rs-feed')
const view_header = $('.rs-header')
const view_title = $('.rs-title')
const view_content = $('.rs-content')
const view_link = $('.rs-link')

const S = {
    me: 1,
    on: false,
    feed_id: null,
}

function update() {
    if (!visibility(S, view))
        return

    const feed = model.feed()

    model.modFeed(feed, 'seen', 1)

    if (feed.star)
        view_header.addClass('rs-stared')
    else
        view_header.removeClass('rs-stared')

    if (S.feed_id != feed.feed_id) {
        view_title.html(feed.title)
        view_content.html(feed.content)
        view_link.attr({ href: feed.link })
        S.feed_id = feed.feed_id
    }
}

module.exports = {
    update,
    me: () => S.me,
}