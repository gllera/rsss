const gql = require('graphql.js')(config.RSSS_URL)

const gSync = gql(`
    mutation ($o: SyncData)
    {
        Sync (o: $o)
        {
            sources
            {
                source_id
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
    feeds: {}
}

function sync(flr) {
    const param = {
        flr_page_min: flr.page_min,
        flr_page_max: flr.page_max,
        flr_source_id: flr.source_id,
        flr_tag: flr.tag,
        flr_limit: flr.limit,
        flr_asc: flr.asc,
        flr_seen: flr.seen,
        flr_star: flr.star,
        set_seen: [],
        set_star: [],
        set_unseen: [],
        set_unstar: [],
    }

    for (const i of feeds) {
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

    return gSync({ o: param }).then(e => {
        for (const i of e.feeds) {
            i._seen = i.seen
            i._star = i.star
            data.feeds[i.feed_id] = i
        }

        data.sources = e.sources
    })
}

module.exports = {
    data,
    sync
}
