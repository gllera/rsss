const $ = require('cash-dom')
const { model, visibility } = require('../utils')

const view = $('.rs-feed')
const view_title = $('.rs-title')
const view_content = $('.rs-content')
const view_link = $('.rs-link')

const S = {
    me: 1,
    on: false,
}

function update() {
    if (!visibility(S, view))
        return

    const feed = model.feed()

    if (feed) {
        model.modFeed(feed, 'seen', 1)

        view_title.html(feed.title)
        view_content.html(feed.content)
        view_link.attr({ href: feed.link })
    }
    else {
        view_title.html('')
        view_content.html('(no feed to show, try to fetch them)')
        view_link.attr({ href: '' })
    }
}

module.exports = {
    update,
    me: () => S.me,
}