let ctrl = require('./controller')

class GraphQL {
    constructor(url) {
        this._gql = require('graphql.js')(url)
    }

    modFeed({ feed_id, seen, star }) {
        if (feed_id < 0)
            return

        let query = []

        query.push(`feed_id: ${feed_id}`)

        if (seen !== undefined)
            query.push(`seen: ${seen}`)
        if (star !== undefined)
            query.push(`star: ${star}`)

        this._gql(`mutation { modFeed(${query.join(',')}) }`)()
            .catch((err) => ctrl.updateSources(null, err))
    }

    fetchSources() {
        this._gql(`query { Sources { source_id url title description siteUrl lang count unseen stars } }`)()
            .then((res) => ctrl.updateSources(res.Sources))
            .catch((err) => ctrl.updateSources(null, err))
    }

    fetchFeeds({ seen } = {}) {
        let query = []

        if (seen !== undefined && seen !== null)
            query.push(`seen: ${seen}`)

        query = query.length ? '(' + query.join(',') + ')' : ''

        this._gql(`query { Feeds${query} { date feed_id source_id url title content } }`)()
            .then((res) => ctrl.updateFeeds(res.Feeds))
            .catch((err) => ctrl.updateFeeds(null, err))
    }
}

let db = {
    get: (key) => window.localStorage.getItem(key),
    set: (key) => window.localStorage.setItem(key)
}

module.exports = (url) => new GraphQL(url)