const { feed, sources } = require('./views')
const { db } = require('./utils')

function update() {
    feed.update()
    sources.update()
}

module.exports = {
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
        feed.show()
        sources.hide()
    },
    showPanel: () => {
        feed.hide()
        sources.show()
    },
    fetch: () => {
        db.fetch()
            .then(() => update())
            .catch(e => alert(JSON.stringify(e)))
    },
}
