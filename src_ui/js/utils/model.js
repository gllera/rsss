const graphql = require('./graphql')

let sourcesFiltered = [], feedsFiltered = [], tagsFiltered = []
const sourcesTags = {}, $ = {
    view: 0,
    idx: -1,
    seen: 1,
    star: 0,
    source_id: 0,
    tag: undefined,
    asc: 0,
    exclude: [],
}

function updSources(s) {
    s.forEach(e => sourcesTags[e.source_id] = e.tag)

    const srcsTmp = s.filter(e => (!$.seen || e.unseen > 0) && (!$.star || e.stars > 0))
    sourcesFiltered = srcsTmp.filter(e => !$.tag || e.tag == $.tag)

    const srcsTagged = srcsTmp.filter(e => e.tag)
    const ts = {}, all = { title: 'ALL', count: 0, unseen: 0, stars: 0, tag_filter: undefined, }

    srcsTagged.forEach(e => !ts[e.tag] && (
        ts[e.tag] = {
            title: e.tag,
            count: 0,
            unseen: 0,
            stars: 0,
            tag_filter: e.tag,
        }
    ))

    const k = ['count', 'unseen', 'stars']
    k.forEach(i => {
        srcsTagged.forEach(e => ts[e.tag][i] += e[i])
        srcsTmp.forEach(e => all[i] += e[i])
    })

    tagsFiltered = [all].concat(Object.keys(ts).map(e => ts[e]))
}

function updFeeds(feeds) {
    feedsFiltered = feedsFiltered.concat(feeds
        .filter(e =>
            (!$.seen || !e.seen) &&
            (!$.star || e.star) &&
            (!$.source_id || e.source_id == $.source_id) &&
            (!$.tag || sourcesTags[e.source_id] == $.tag))
        .sort((a, b) =>
            $.asc ? (a.date < b.date) : (a.date > b.date))
    )

    $.exclude = feedsFiltered.map(e => e.feed_id)

    if ($.idx == -1 && feedsFiltered.length)
        $.idx = 0
}

function filter(o) {
    if (!o) return $
    if (o.star) o.seen = 0
    if (o.seen) o.star = 0

    Object.keys(o).forEach(e => $[e] = o[e])

    feedsFiltered = []
    $.idx = -1

    updSources(graphql.sources())
    updFeeds(graphql.feeds())
}

function hash(h) {
    if (!h) {
        const bin = '1' + $.seen + $.star + $.asc + $.view + (!$.source_id ? '' : $.source_id.toString(2))
        return parseInt(bin, 2).toString(16) + '~' + ($.tag || '')
    }

    const arr = h.substring(1).split('~')
    const v = parseInt(arr[0], 16).toString(2)

    $.seen = parseInt(v[1])
    $.star = parseInt(v[2])
    $.asc = parseInt(v[3])
    $.view = parseInt(v[4])
    $.source_id = v.length == 5 ? 0 : parseInt(v.substring(5), 2)
    $.tag = arr[1] ? arr[1] : undefined

    filter({})
}

module.exports = {
    hash,
    filter,
    view: (o) => o != undefined ? $.view = o : $.view,
    feed: () => $.idx != -1 ? feedsFiltered[$.idx] : null,
    sources: () => sourcesFiltered,
    tags: () => tagsFiltered,

    fetchFeeds: () => graphql.fetchFeeds({
        source_id: $.source_id ? $.source_id : undefined,
        seen: $.seen ? 0 : undefined,
        star: $.star ? 1 : undefined,
        tag: $.tag,
        asc: $.asc,
        exclude: $.exclude,
    }).then(updFeeds),
    fetchSources: () => graphql.fetchSources().then(updSources),

    modFeed: (f, k, v) => graphql.modFeed(f, k, v != undefined ? v : (f && f[k] ? 0 : 1)),
    nextFeed: (amt) => {
        $.idx += amt

        if ($.idx >= feedsFiltered.length)
            $.idx = feedsFiltered.length - 1

        if ($.idx < 0)
            $.idx = feedsFiltered.length ? 0 : -1
    },
}
