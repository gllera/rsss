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
    next: () => {
        db.nextFeed()
        update()
    },
    prev: () => {
        db.prevFeed()
        update()
    },
    updateSources: (data, err) => sources.update(data, err),
    updateFeeds: (data, err) => feed.update(data, err),
    filterFeeds: (opts) => feed.filter(opts),
    sync: () => {
        db.sync()
            .then(() => update())
            .catch(e => alert(JSON.stringify(e)))
    },
    toggleVal: k => {
        if (db.getView() == feed.me()) {
            const currFeed = db.getFeed()
            if (currFeed)
                db.feedMod(k, currFeed[k] ? 0 : 1)
        } else {
            db.filterToggle(k)
            sources.update()
        }
    },
    showFeeds: () => {
        db.setView('FEED')
        update()
    },
    showSources: () => {
        db.setView('SOURCES')
        update()
    },
    fetch: () => {
        (db.getView() == feed.me() ? db.fetch() : db.sync())
            .then(() => update())
            .catch(e => alert(JSON.stringify(e)))
    },
}
