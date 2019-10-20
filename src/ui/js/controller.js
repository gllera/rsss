let feed, panel, graphql

module.exports = {
    config: (opts) => {
        feed = opts.feedView
        panel = opts.panelView
        graphql = opts.graphql
    },
    next: () => feed.next(),
    prev: () => feed.prev(),
    updateSources: (data, err) => panel.update(data, err),
    updateFeeds: (data, err) => feed.update(data, err),
    filterFeeds: (opts) => feed.filter(opts),
    setSeen: () => graphql.modFeed({ feed_id: feed.currentFeedId(), seen: 1 }),
    setStar: () => graphql.modFeed({ feed_id: feed.currentFeedId(), star: 1 }),
    unsetSeen: () => graphql.modFeed({ feed_id: feed.currentFeedId(), seen: 0 }),
    unsetStar: () => graphql.modFeed({ feed_id: feed.currentFeedId(), star: 0 }),
    showFeeds: () => {
        feed.show()
        panel.hide()
    },
    showPanel: () => {
        feed.hide()
        panel.show()
    },
    fetch: () => {
        graphql.fetchFeeds({ seen: 0 })
        graphql.fetchSources()
    },
}
