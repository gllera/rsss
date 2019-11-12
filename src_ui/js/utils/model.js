const graphql = require('./graphql')

let sourcesFiltered = [], feedsFiltered = [], tagsFiltered = []
const filter_keys = ['source_id', 'seen', 'star', 'tag']
const sourcesTags = {}, state = {
    view: 'SOURCES',
    idx: -1,
    filter: {
        source_id: undefined,
        tag: undefined,
        seen: 0,
        star: undefined,
        asc: 0,
        exclude: []
    },
}

function updSources(s) {
    s.forEach(e => sourcesTags[e.source_id] = e.tag)

    const i = {}, f = state.filter
    filter_keys.forEach(e => i[e] = f[e] == undefined)

    const srcsTmp = s.filter(e => (i.seen || e.unseen > 0) && (i.star || e.stars > 0))
    sourcesFiltered = srcsTmp.filter(e => i.tag || e.tag == f.tag)

    const srcsTagged = srcsTmp.filter(e => e.tag)
    const ts = {}, all = { title: 'ALL', count: 0, unseen: 0, stars: 0, }

    srcsTagged.forEach(e => !ts[e.tag] && (
        ts[e.tag] = {
            title: e.tag,
            count: 0,
            unseen: 0,
            stars: 0,
            tag: e.tag,
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
    const filter = state.filter
    feeds.forEach(e => e.tag = sourcesTags[e.source_id])

    feedsFiltered = feedsFiltered.concat(feeds
        .filter(e =>
            filter_keys.every(i => filter[i] == undefined || filter[i] == e[i]))
        .sort((a, b) =>
            filter.asc ? (a.date < b.date) : (a.date > b.date))
    )

    filter.exclude = feedsFiltered.map(e => e.feed_id)
}

function filter(o) {
    if (o == undefined)
        return state.filter

    if (o.star != undefined)
        o.seen = undefined
    if (o.seen != undefined)
        o.star = undefined

    Object.keys(o).forEach(e => state.filter[e] = o[e])

    updSources(graphql.sources())
    feedsFiltered = []
    updFeeds(graphql.feeds())
    state.idx = feedsFiltered.length ? 0 : -1
}

module.exports = {
    filter,
    view: (o) => o != undefined ? state.view = o : state.view,
    feed: () => state.idx != -1 ? feedsFiltered[state.idx] : null,
    sources: () => sourcesFiltered,
    tags: () => tagsFiltered,


    fetchFeeds: () => graphql.fetchFeeds(state.filter).then(updFeeds),
    fetchSources: () => graphql.fetchSources().then(updSources),

    modFeed: (f, k, v) => graphql.modFeed(f, k, v != undefined ? v : (f && f[k] ? 0 : 1)),
    nextFeed: (amt) => {
        state.idx += amt

        if (state.idx >= feedsFiltered.length)
            state.idx = feedsFiltered.length - 1

        if (state.idx < 0)
            state.idx = feedsFiltered.length ? 0 : -1
    },
}
