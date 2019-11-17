const graphql = require('./graphql')

let sourcesFiltered = [], feedsFiltered = [], tagsFiltered = []
const filter_keys = ['source_id', 'seen', 'star', 'tag']
const sourcesTags = {}, state = {
    view: 0,
    idx: -1,
    filter: {
        source_id: undefined,
        tag: undefined,
        seen: 0,
        star: undefined,
        asc: 0,
        exclude: [],
    },
}

function updSources(s) {
    s.forEach(e => sourcesTags[e.source_id] = e.tag)

    const i = {}, f = state.filter
    filter_keys.forEach(e => i[e] = f[e] == undefined)

    const srcsTmp = s.filter(e => (i.seen || e.unseen > 0) && (i.star || e.stars > 0))
    sourcesFiltered = srcsTmp.filter(e => i.tag || e.tag == f.tag)

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
    const filter = state.filter
    feeds.forEach(e => e.tag = sourcesTags[e.source_id])

    feedsFiltered = feedsFiltered.concat(feeds
        .filter(e =>
            filter_keys.every(i => filter[i] == undefined || filter[i] == e[i]))
        .sort((a, b) =>
            filter.asc ? (a.date < b.date) : (a.date > b.date))
    )

    filter.exclude = feedsFiltered.map(e => e.feed_id)

    if (state.idx == -1 && feedsFiltered.length)
        state.idx = 0
}

function filter(o) {
    if (!o)
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

function hashVars(o) {
    if (!o)
        return [
            state.filter.seen,
            state.filter.star,
            state.filter.asc,
            state.view,
            state.filter.source_id,
            state.filter.tag,
        ]

    state.filter.seen = o[0]
    state.filter.star = o[1]
    state.filter.asc = o[2]
    state.view = o[3]
    state.filter.source_id = o[4]
    state.filter.tag = o[5]
}

function hash(h) {
    const values = [
        [undefined, 0],
        [undefined, 1],
        [0, 1],
        [0, 1],
    ]

    if (!h) {
        const vars = hashVars()

        const bin = '1' +
            (vars[0] == values[0][0] ? '0' : '1') +
            (vars[1] == values[1][0] ? '0' : '1') +
            (vars[2] == values[2][0] ? '0' : '1') +
            (vars[3] == values[3][0] ? '0' : '1') +
            (vars[4] == undefined ? '' : vars[4].toString(2))

        return parseInt(bin, 2).toString(16) + '~' + (vars[5] || '')
    }

    const arr = h.substring(1).split('~')
    const v = parseInt(arr[0], 16).toString(2)

    hashVars([
        v[1] == '0' ? values[0][0] : values[0][1],
        v[2] == '0' ? values[1][0] : values[1][1],
        v[3] == '0' ? values[2][0] : values[2][1],
        v[4] == '0' ? values[3][0] : values[3][1],
        v.length == 5 ? undefined : parseInt(v.substring(5), 2),
        arr[1] ? arr[1] : undefined
    ])

    filter({})
}

module.exports = {
    hash,
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
