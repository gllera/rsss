let feed, sources, db

function update() {
    feed.update()
    sources.update()
}

module.exports = {
    init: (_feed, _sources, _db) => {
        feed = _feed
        sources = _sources
        db = _db
    },
    next: () => feed.next(),
    prev: () => feed.prev(),
    updateSources: (data, err) => sources.update(data, err),
    updateFeeds: (data, err) => feed.update(data, err),
    filterFeeds: (opts) => feed.filter(opts),
    setSeen: () => db.modFeed({ feed_id: feed.currentFeedId(), seen: 1 }),
    setStar: () => db.modFeed({ feed_id: feed.currentFeedId(), star: 1 }),
    unsetSeen: () => db.modFeed({ feed_id: feed.currentFeedId(), seen: 0 }),
    unsetStar: () => db.modFeed({ feed_id: feed.currentFeedId(), star: 0 }),
    showFeeds: () => {
        db.setView('FEED')
        update()
    },
    showSources: () => {
        db.setView('SOURCES')
        update()
    },
    fetch: () => {
        db.fetch()
            .then(() => update())
            .catch(e => alert(JSON.stringify(e)))
    },
}
