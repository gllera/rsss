const express = require('express')
const logger = require('morgan')
const cors = require('cors')
const graphqlHTTP = require('express-graphql')
const { importSchema } = require('graphql-import')
const { makeExecutableSchema } = require('graphql-tools')
const { resolvers, fetcher, db, procesor } = require('./core')
const { configs } = require('./utils')

async function appPromise() {
    let app = express()
    app.use(logger('dev'))
    app.use(cors())

    if (configs.GUI_USER)
        app.use(express.static('dist'))

    app.use('/gql', graphqlHTTP({
        schema: makeExecutableSchema({
            typeDefs: importSchema('schema.graphql'),
            resolvers: await resolvers(await db(), fetcher(procesor))
        }),
        graphiql: configs.GUI_GRAPHQL,
    }))

    return app
}

module.exports = appPromise