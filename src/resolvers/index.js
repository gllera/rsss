const feed = require('./feed')
const source = require('./source')

module.exports = {
        Query: {
            Test: async (root, { url }) => JSON.stringify(await Parse(url)),
            ...feed.Query,
            ...source.Query,
        },
        Mutation: {
            ...feed.Mutation,
            ...source.Mutation,
        }
}