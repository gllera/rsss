const gql = require('graphql.js')(config.GRAPHQL_URL)

const gFeeds = gql('query ($o: QueFeed!) { feeds(o: $o) { feed_id source_id url title content date seen star } }')
const gSync = gql('mutation ($o: SyncData) { sync(o: $o) { source_id url title description siteUrl lang count unseen stars err } }')

const filter_keys = ['source_id', 'seen', 'star']
const filter_values = {
    seen: [0, undefined],
    star: [1, undefined],
}
const state = {
    view: 'SOURCES',
    idx: -1,
    filter: {
        asc: 0,
        seen: 0,
        star: undefined,
        source_id: undefined,
    },
    seen: new Set(),
    star: new Set(),
}

let sources = [], feeds = []
let sourcesFiltered = [], feedsFiltered = []
let recieved = new Set()

function fetch() {
    return gFeeds({ o: state.filter })
        .then(e => updFeeds(e.feeds))
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
        updSources()
    })
}

function getFeed() {
    if (state.idx != -1)
        return feedsFiltered[state.idx]
    else
        return null
}

function getSources() {
    return sourcesFiltered
}

function updSources() {
    sourcesFiltered = sources.filter(e => filter_keys.every(i => {
        if (i == 'source_id' || state.filter[i] == undefined)
            return true

        if (i == 'seen')
            return e.unseen > 0
        else
            return e.stars > 0
    }))
}

function updFeeds(newFeeds) {
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
    console.log(filter)

    feedsFiltered = feeds.filter(e => filter_keys.every(i => filter[i] === undefined || filter[i] === e[i]))
    feedsFiltered.sort((a, b) => filter.asc ? (a.date < b.date) : (a.date > b.date))
    state.idx = feedsFiltered.length ? 0 : -1
}

function filterToggle(k) {
    const v = state.filter[k]
    const idx = (filter_values[k].indexOf(v) + 1) % filter_values[k].length

    filter({ [k]: filter_values[k][idx] })
}

function filter(o) {
    if (o === undefined)
        return state.filter

    if (o.star != undefined)
        o.seen = undefined
    if (o.seen != undefined)
        o.star = undefined

    Object.keys(o).forEach(e => state.filter[e] = o[e])
    updFeeds()
    updSources()
}

let db = {
    get: (key) => window.localStorage.getItem(key),
    set: (key) => window.localStorage.setItem(key)
}

function changeFeed(amount) {
    state.idx += amount

    if (state.idx >= feedsFiltered.length)
        state.idx = feedsFiltered.length - 1

    if (state.idx < 0)
        state.idx = feedsFiltered.length ? 0 : -1
}

function feedMod(k, v) {
    const feed = getFeed()
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
    filterToggle,
    fetch,
    feedMod,
    getFeed,
    getSources,
    getView: () => state.view,
    setView: (o) => state.view = o,
    nextFeed: () => changeFeed(1),
    prevFeed: () => changeFeed(-1),
}
