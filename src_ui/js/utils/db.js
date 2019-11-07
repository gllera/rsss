const gql = require('graphql.js')(config.GRAPHQL_URL)

const gSources = gql('query { sources { source_id url title description siteUrl lang count unseen stars err } }')
const gFeeds = gql('query ($o: QueFeed!) { feeds(o: $o) { feed_id source_id url title content date seen star } }')
const gSync = gql('mutation ($o: SyncData) { sync(o: $o) { source_id url title description siteUrl lang count unseen stars err } }')

const state = {
    view: 'SOURCES',
    idx: -1,
    filter: {
        asc: 0,
        seen: 0,
        source_id: null,
    },
    seen: new Set(),
    star: new Set(),
}

let sources = []
let feeds = []
let filteredFeeds = []
let recieved = new Set()

function fetch() {
    switch (state.view) {
        case 'SOURCES': return gSources().then(e => sources = e.sources)
        case 'FEED': return gFeeds({ o: state.filter }).then(e => update(e.feeds))
        default: return new Promise()
    }
}

function sync() {
    return gSync({
        o: {
            seen: Array.from(state.seen),
            star: Array.from(state.star),
        }
    }).then(e => {
        sources = e.sync
        state.seen.clear()
        state.star.clear()
    })
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

function update(newFeeds) {
    if (Array.isArray(newFeeds)) {
        if (newFeeds.length)
            feeds = feeds.concat(newFeeds.filter(e => {
                if (recieved.has(e.feed_id))
                    return false
                else
                    recieved.add(e.feed_id)

                return true
            }))
        else
            return
    }

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

    keys.forEach(e => {
        if (o[e] !== undefined && o[e] !== state.filter[e])
            state.filter[e] = o[e]
    })

    update()
}

let db = {
    get: (key) => window.localStorage.getItem(key),
    set: (key) => window.localStorage.setItem(key)
}

function changeFeed(amount) {
    state.idx += amount

    if (state.idx >= filteredFeeds.length)
        state.idx = filteredFeeds.length - 1

    if (state.idx < 0)
        state.idx = filteredFeeds.length ? 0 : -1
}

function feedMod(k, v) {
    const feed = currentFeed()
    const sign = v ? -1 : 1

    if (feed && feed[k] != v) {
        feed[k] = v

        if (state[k].has(feed.feed_id * sign))
            state[k].delete(feed.feed_id * sign)
        else
            state[k].add(feed.feed_id * sign * -1)
    }
}

module.exports = {
    sync,
    filter,
    fetch,
    feedMod,
    getView: () => state.view,
    setView: (o) => state.view = o,
    currentFeed,
    currentSources,
    nextFeed: () => changeFeed(1),
    prevFeed: () => changeFeed(-1),
}
