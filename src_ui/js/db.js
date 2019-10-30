const gql = require('graphql.js')(config.GRAPHQL_URL)

const gSources = gql('query { sources { source_id url title description siteUrl lang count unseen stars } }')
const gFeeds = gql('query { feeds(o: $o) { date feed_id source_id url title content } }')
const gFeedMod = gql('mutation { feedMod(o: $o) }')

let state = {
    view: 'PANEL',
    idx: -1,
}

function sourcesFetch() {
    return gSources().then(res => resolve(res))
}

function feedMod(o) {
    return gFeedMod(o)
}

function feedsFetch(o) {
    return gFeeds({ o })
}

function currentFeed() {
    return state
}

function currentSources() {
    return state
}

let db = {
    get: (key) => window.localStorage.getItem(key),
    set: (key) => window.localStorage.setItem(key)
}

module.exports = {
    sourcesFetch,
    feedsFetch,
    feedMod,

    currentView: () => state.view,
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
