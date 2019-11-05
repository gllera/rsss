const gql = require('graphql.js')(config.GRAPHQL_URL)

const gSources = gql('query { sources { source_id url title description siteUrl lang count unseen stars } }')
const gFeeds = gql('query ($o: QueFeed!) { feeds(o: $o) { date feed_id source_id url title content } }')
const gFeedMod = gql('mutation { feedMod(o: $o) }')

const state = {
    view: 'SOURCES',
    idx: -1,
    filter: {
        order: 0,
        hidden: 0,
    },
}

let sources = []
let feeds = []

function fetch(o) {
    switch (state.view) {
        case 'SOURCES': return gSources().then(e => sources = e.sources)
        case 'FEED': return gFeeds({ o }).then(e => feeds.concat(e.feeds))
        default: return new Promise()
    }
}

function feedMod(o) {
    return gFeedMod({ o })
}

function currentFeed() {
    return state
}

function currentSources() {
    return sources
}

let db = {
    get: (key) => window.localStorage.getItem(key),
    set: (key) => window.localStorage.setItem(key)
}

module.exports = {
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
