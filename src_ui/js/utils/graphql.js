const gql = require('graphql.js')(config.RSSS_URL)

const gFeeds = gql('mutation ($o: QueFeed!, $s: SyncData) { feeds(o: $o, s: $s) { feed_id source_id link title content date seen star } }')
const gSources = gql('mutation ($s: SyncData) { sources(s: $s) { source_id xml_url title description html_url lang tag count unseen stars err } }')

let sources = [], feeds = []
const recieved = new Set()
const pending = {
    seen: new Set(),
    star: new Set(),
}

function fetchFeeds(filter) {
    return gFeeds({
        o: filter,
        s: {
            seen: Array.from(pending.seen),
            star: Array.from(pending.star),
        }
    }).then(e => {
        e = e.feeds.filter(e => {
            if (recieved.has(e.feed_id))
                return false

            recieved.add(e.feed_id)
            return true
        })

        feeds = feeds.concat(e)
        pending.seen.clear()
        pending.star.clear()

        return e
    })
}

function fetchSources() {
    return gSources({
        s: {
            seen: Array.from(pending.seen),
            star: Array.from(pending.star),
        }
    }).then(e => {
        pending.seen.clear()
        pending.star.clear()

        return sources = e.sources
    })
}

function modFeed(f, k, v) {
    if (!f)
        return

    const sign = v ? 1 : -1
    f[k] = v

    if (pending[k].has(f.feed_id * sign * -1))
        pending[k].delete(f.feed_id * sign * -1)
    else
        pending[k].add(f.feed_id * sign)
}

module.exports = {
    sources: () => sources,
    feeds: () => feeds,
    fetchFeeds,
    fetchSources,
    modFeed,
}
