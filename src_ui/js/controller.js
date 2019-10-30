let feed = require('./views/feed')
let panel = require('./views/sources')
let db = require('./db')

module.exports = {
    next: () => feed.next(),
    prev: () => feed.prev(),
    updateSources: (data, err) => panel.update(data, err),
    updateFeeds: (data, err) => feed.update(data, err),
    filterFeeds: (opts) => feed.filter(opts),
    setSeen: () => db.modFeed({ feed_id: feed.currentFeedId(), seen: 1 }),
    setStar: () => db.modFeed({ feed_id: feed.currentFeedId(), star: 1 }),
    unsetSeen: () => db.modFeed({ feed_id: feed.currentFeedId(), seen: 0 }),
    unsetStar: () => db.modFeed({ feed_id: feed.currentFeedId(), star: 0 }),
    showFeeds: () => {
        feed.show()
        panel.hide()
    },
    showPanel: () => {
        feed.hide()
        panel.show()
    },
    fetch: () => {
        db.fetchFeeds({ seen: 0 })
        db.fetchSources()
    },
}
