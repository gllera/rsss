const gql = require('graphql.js')(config.GRAPHQL_URL)

const gSources = gql('query { sources { source_id url title description siteUrl lang count unseen stars err } }')
const gFeeds = gql('query ($o: QueFeed!) { feeds(o: $o) { feed_id source_id url title content date seen star } }')
const gFeedMod = gql('mutation { feedMod(o: $o) }')

const state = {
    view: 'SOURCES',
    idx: -1,
    filter: {
        asc: 0,
        seen: 0,
        source_id: null,
    },
}

let sources = []
let feeds = []
let filteredFeeds = []

function fetch() {
    switch (state.view) {
        case 'SOURCES': return gSources().then(e => sources = e.sources)
        case 'FEED': return gFeeds({ o: state.filter }).then(e => {
            if (e.feeds.length) {
                feeds = feeds.concat(e.feeds)
                update()
            }
        })
        default: return new Promise()
    }
}

function feedMod(o) {
    return gFeedMod({ o })
}

function currentFeed() {
    if (state.idx != -1)
        return filteredFeeds[state.idx]
    else
        return null
}

function currentSources() {
    return sources
}

function update(filterChaged) {
    const filter = state.filter

    filteredFeeds = feeds.filter(e => {
        if (filter.source_id !== null && filter.source_id !== e.source_id)
            return false
        if (filter.source_id !== null && filter.seen !== e.seen)
            return false

        return true
    })

    filteredFeeds.sort((a, b) => filter.asc ? (a.date < b.date) : (a.date > b.date))
    state.idx = filteredFeeds.length ? 0 : -1
}

function filter(o) {
    const keys = ['asc', 'seen', 'source_id']
    let changed = false

    keys.forEach(e => {
        if (o[e] !== undefined && o[e] !== state.filter[e]) {
            state.filter[e] = o[e]
            changed = true
        }
    })

    if (changed)
        update(true)
}

let db = {
    get: (key) => window.localStorage.getItem(key),
    set: (key) => window.localStorage.setItem(key)
}

module.exports = {
    filter,
    fetch,
    feedMod,
    getView: () => state.view,
    setView: (o) => state.view = o,
    currentFeed,
    currentSources,
}


// function filter(opts = {}) {
//     opts = utils.defaults(opts, this._filterOpts)
//     this._feedsFiltered = []

//     this._feeds.forEach(e => {
//         if (e.source_id == opts.source_id)
//             this._feedsFiltered.push(e)
//     })

//     this._idx = -1
//     this._set()
// }

// currentFeedId() {
//     return this._feed_id
// }

// next() {
//     this._idx++
//     this._set()
// }

// prev() {
//     this._idx--
//     this._set()
// }
