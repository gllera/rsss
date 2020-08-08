const $ = require('cash-dom')

const view_header = $('.rs-header')
const view_title = $('.rs-title')
const view_content = $('.rs-content')
const view_link = $('.rs-link')

function update(feed) {
    if (feed.star)
        view_header.addClass('rs-stared')
    else
        view_header.removeClass('rs-stared')

    view_title.html(feed.title)
    view_content.html(feed.content)
    view_link.attr({ href: feed.link })
}

module.exports = {
    $: $('.rs-feed'),
    update,
}