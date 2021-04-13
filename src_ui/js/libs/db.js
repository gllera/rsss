const gql = require('graphql.js')(config.RSSS_URL)

const gSync = gql(`
    mutation ($o: FeedsFilterInput, $s: SetFeedsInput)
    {
        sync (o: $o, s: $s)
        {
            sources
            {
                source_id
                title
                tag
                unseen
                stars
                err
            }

            feeds
            {
                feed_id
                source_id
                link
                title
                content
                date
                seen
                star
            }
        }
    }
`)

const data = {
    sources: [],
    feedsById: {},
    feedsByHash: {},
}

function fillFeedSetter() {
    const res = {
        seen: [],
        star: [],
        unseen: [],
        unstar: [],
    }

    for (const i of Object.values(data.feedsById)) {
        if (i.seen != i._seen)
            if (i.seen)
                res.seen.push(i.feed_id)
            else
                res.unseen.push(i.feed_id)

        if (i.star != i._star)
            if (i.star)
                res.star.push(i.feed_id)
            else
                res.unstar.push(i.feed_id)
    }

    if (!res.seen.length)   res.seen = undefined
    if (!res.star.length)   res.star = undefined
    if (!res.unseen.length) res.unseen = undefined
    if (!res.unstar.length) res.unstar = undefined

    return res
}

function sync(flr, hash) {
    let feeds = data.feedsByHash[hash]

    if (!feeds)
        feeds = data.feedsByHash[hash] = []

    const params = {
        s: fillFeedSetter(),
        o: {
            ...flr,
            last_id: feeds.length ? feeds[feeds.length - 1].feed_id : undefined,
        }
    }

    return gSync(params).then(e => {
        for (const i of params.s.seen   || []) data.feedsById[i]._seen = 1
        for (const i of params.s.star   || []) data.feedsById[i]._star = 1
        for (const i of params.s.unseen || []) data.feedsById[i]._seen = 0
        for (const i of params.s.unstar || []) data.feedsById[i]._star = 0

        for (const i of e.sync.feeds) {
            feeds.push(i)

            i._seen = i.seen
            i._star = i.star

            if (data.feedsById[i.feed_id])
                Object.assign(data.feedsById[i.feed_id], i)
            else
                data.feedsById[i.feed_id] = i
        }

        data.sources = e.sync.sources
    })
}

function tags() {
    const tags = {}, total = {
        title: 'ALL',
        unseen: 0,
        stars: 0,
    }

    for (const i of data.sources) {
        total.unseen += i.unseen
        total.stars += i.stars

        if (i.tag) {
            if (!tags[i.tag])
                tags[i.tag] = {
                    title: i.tag,
                    tag: i.tag,
                    unseen: 0,
                    stars: 0
                }

            tags[i.tag].unseen += i.unseen
            tags[i.tag].stars += i.stars
        }
    }

    return [total, ...Object.values(tags)]
}

const feeds = (hash) => data.feedsByHash[hash] || []

module.exports = {
    sources: () => data.sources,
    feeds_count: (hash) => feeds(hash).length,
    feed: (hash, idx) => feeds(hash)[idx],
    sync,
    tags,
}
