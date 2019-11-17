const feed = require('./feed')
const source = require('./source')

module.exports = {
    Query: {
        ...feed.Query,
        ...source.Query,
    },
    Mutation: {
        ...feed.Mutation,
        ...source.Mutation,
    }
}