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

    app.use('/', graphqlHTTP({
        schema: makeExecutableSchema({
            typeDefs: importSchema('schema.graphql'),
            resolvers: await resolvers(await db(), fetcher(procesor))
        }),
        graphiql: configs.graphql.gui,
    }))

    return app
}

module.exports = appPromise