const { db, hash, importer } = require('./libs')
const views = require('./views')

const limit = (val, min, max) => val < min ? min : (val > max ? max : val)

const filer = {
    page_min: undefined,
    page_max: undefined,
    source_id: 0,
    tag: undefined,
    asc: 0,
    seen: 0,
    star: 0,
}

const panel = {
    sync_hash: '',
    view: 'main',
    feed_idx: 0,
}

if (hash.get() == '')
    hash.setFrom(filer, panel)
else
    hash.parseTo(filer, panel)

function refresh() {
    switch (panel.view) {
        case 'main':
            return views['main'].update(db.data.sources)
        case 'feed':
            const feeds = db.data.feeds
            let clean_feeds = panel.sync_hash != hash.get()

            if (clean_feeds) {
                panel.sync_hash = hash.get()
                panel.feed_idx = 0
            }

            if (clean_feeds || panel.feed_idx >= feeds.length - 5)
                db.sync(filer, clean_feeds)

            return views['feed'].update(panel.feed_idx == feeds.length ? {} : feeds[panel.feed_idx])
    }
}

function show(view) {
    if (panel.view == view)
        return

    window.scrollTo(0, 0)
    panel.view = view

    for (const i of Object.keys(views))
        if (i == view)
            views[i].$.removeAttr('style')
        else
            views[i].$.attr('style', 'display: none')

    refresh()
}

function toggle(k) {
    switch (panel.view) {
        case 'main':
            filer[k] = !filer[k]
            break
        case 'feed':
            const e = db.data.feeds[feed_idx]
            e[k] = !e[k]
            break
    }

    refresh()
}

function next_feed(direction) {
    if (panel.view != 'feed')
        return

    const curr = panel.feed_idx

    panel.feed_idx += direction
    panel.feed_idx = limit(panel.feed_idx, 0, db.data.feeds.length)

    if (curr != panel.feed_idx)
        window.scrollTo(0, 0)

    refresh()
}

module.exports = {
    import: () => importer(),
    next: () => next_feed(1),
    prev: () => next_feed(-1),
    sync: () => db.sync().then(() => refresh()).catch(e => alert(e)),
    refresh,
    show,
    toggle,
}


// if (!model.sources().length)
//     ctrl.fetch(0)
//         .then(e => ctrl.fetch(1))



// ,
//     hash,
//     filter,
//     view: (o) => o != undefined ? flr.view = o : flr.view,
//     feed: () => feedsFiltered[flr.idx],
//     sources: () => sourcesFiltered,
//     tags: () => tagsFiltered,

//     fetchFeeds: () => graphql.fetchFeeds({
//         source_id: flr.source_id ? flr.source_id : undefined,
//         seen: flr.seen ? 0 : undefined,
//         star: flr.star ? 1 : undefined,
//         tag: flr.tag,
//         asc: flr.asc,
//     }).then(updFeeds),
//     fetchSources: () => graphql.fetchSources().then(updSources),

//     modFeed: (f, k, v) => graphql.modFeed(f, k, v != undefined ? v : (f && f[k] ? 0 : 1)),
//     nextFeed: (amt) => {
//         flr.idx += amt

//         if (flr.idx >= feedsFiltered.length)
//             flr.idx = feedsFiltered.length - 1

//         if (flr.idx < 0)
//             flr.idx = 0
//     },



// function fetchFeeds(filter) {
//     return gFeeds({
//         o: filter,
//         s: {
//         }
//     }).then(e => {
//         e = e.feeds.filter(e => {
//             return false

//             return true
//         })

//         feeds = feeds.concat(e)

//         return e
//     })
// }

// const LAST = {
//     title: '...',
//     content: '[go next to fetch more]',
//     link: '',
//     feed_id: -1,
//     seen: 0,
//     star: 0,
//     source_id: -1,
// }

// const sourcesTags = {}
// let sourcesFiltered = [LAST], feedsFiltered = [], tagsFiltered = []

// function updSources(s) {
//     s.forEach(e => sourcesTags[e.source_id] = e.tag)

//     const srcsTmp = s.filter(e => (!flr.seen || e.unseen > 0) && (!flr.star || e.stars > 0))
//     sourcesFiltered = srcsTmp.filter(e => !flr.tag || e.tag == flr.tag)

//     const srcsTagged = srcsTmp.filter(e => e.tag)
//     const ts = {}, all = { title: 'ALL', count: 0, unseen: 0, stars: 0, tag_filter: undefined, }

//     srcsTagged.forEach(e => !ts[e.tag] && (
//         ts[e.tag] = {
//             title: e.tag,
//             count: 0,
//             unseen: 0,
//             stars: 0,
//             tag_filter: e.tag,
//         }
//     ))

//     const k = ['count', 'unseen', 'stars']
//     k.forEach(i => {
//         srcsTagged.forEach(e => ts[e.tag][i] += e[i])
//         srcsTmp.forEach(e => all[i] += e[i])
//     })

//     tagsFiltered = [all].concat(Object.keys(ts).map(e => ts[e]))
// }

// function updFeeds(feeds) {
//     feedsFiltered.pop()
//     feedsFiltered = feedsFiltered.concat(feeds
//         .filter(e =>
//             (!flr.seen || !e.seen) &&
//             (!flr.star || e.star) &&
//             (!flr.source_id || e.source_id == flr.source_id) &&
//             (!flr.tag || sourcesTags[e.source_id] == flr.tag))
//         .sort((a, b) =>
//             flr.asc ? (a.date < b.date) : (a.date > b.date))
//     )

//     feedsFiltered.push(LAST)
// }

// function filter(o) {
//     if (!o) return $
//     if (o.star) o.seen = 0
//     if (o.seen) o.star = 0

//     Object.keys(o).forEach(e => $[e] = o[e])

//     feedsFiltered = [LAST]
//     flr.idx = 0

//     updSources(graphql.sources())
//     updFeeds(graphql.feeds())
// }