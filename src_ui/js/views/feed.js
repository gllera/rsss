const u = require('umbrellajs')
const { model, visibility } = require('../utils')

const view = u('.rs-feed')
const view_title = u('.rs-title')
const view_content = u('.rs-content')
const view_url = u('.rs-url')

const state = {
    me: 'FEED',
    on: false,
}

function update() {
    if (!visibility(state, view))
        return

    const feed = model.feed()

    if (feed) {
        model.modFeed(feed, 'seen', 1)

        view_title.html(feed.title)
        view_content.html(feed.content)
        view_url.attr({ href: feed.url })
    }
    else {
        view_title.html('')
        view_content.html('(no feed to show, try to fetch them)')
        view_url.attr({ href: '' })
    }
}

module.exports = {
    update,
    me: () => state.me,
}