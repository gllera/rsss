const u = require('umbrellajs')
const { model, visibility } = require('../utils')

const view = u('.rs-feed')
const view_title = u('.rs-title')
const view_content = u('.rs-content')
const view_link = u('.rs-link')

const $ = {
    me: 1,
    on: false,
}

function update() {
    if (!visibility($, view))
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
    me: () => $.me,
}