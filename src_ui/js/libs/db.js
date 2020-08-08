const gql = require('graphql.js')(config.RSSS_URL)

const gSync = gql(`
    mutation ($o: SyncData)
    {
        Sync (o: $o)
        {
            sources
            {
                source_id
                title
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
    feeds: []
}

function sync(flr, clean_feeds) {
    const param = {
        flr_page_min: flr.page_min,
        flr_page_max: flr.page_max,
        flr_source_id: flr.source_id,
        flr_tag: flr.tag,
        flr_limit: flr.limit,
        flr_asc: flr.asc ? 1 : undefined,
        flr_seen: flr.seen ? 1 : undefined,
        flr_star: flr.star ? 1 : undefined,
        set_seen: [],
        set_star: [],
        set_unseen: [],
        set_unstar: [],
    }

    for (const i of data.feeds) {
        if (i.seen != i._seen)
            if (i.seen)
                param.set_seen.push(i.feed_id)
            else
                param.set_unseen.push(i.feed_id)

        if (i.star != i._star)
            if (i.star)
                param.set_star.push(i.feed_id)
            else
                param.set_unstar.push(i.feed_id)
    }

    if (!param.set_seen.length) param.set_seen = undefined
    if (!param.set_star.length) param.set_star = undefined
    if (!param.set_unseen.length) param.set_unseen = undefined
    if (!param.set_unstar.length) param.set_unstar = undefined

    if (clean_feeds)
        data.feeds.length = 0

    return gSync({ o: param }).then(e => {
        for (const i of e.Sync.feeds) {
            i._seen = i.seen
            i._star = i.star

            flr.page_min = flr.page_min < e.feed_id ? flr.page_min : e.feed_id
            flr.page_max = flr.page_max > e.feed_id ? flr.page_max : e.feed_id
        }

        data.feeds.concat(e.Sync.feeds)
        data.sources = e.Sync.sources
    })
}

module.exports = {
    data,
    sync,
}
