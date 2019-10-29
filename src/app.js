const express = require('express')
const logger = require('morgan')
const cors = require('cors')
const graphqlHTTP = require('express-graphql')
const { importSchema } = require('graphql-import')
const { makeExecutableSchema } = require('graphql-tools')
const resolvers = require('./resolvers')
const { init } = require('./core')
const { configs } = require('./utils')

async function appPromise() {
    await init()

    let app = express()
    app.use(logger('dev'))
    app.use(cors())

    if (configs.GUI_USER)
        app.use(express.static('dist'))

    app.use('/gql', graphqlHTTP({
        schema: makeExecutableSchema({
            typeDefs: importSchema('shemas_gql/schema.graphql'),
            resolvers
        }),
        graphiql: configs.GUI_GRAPHQL,
    }))

    return app
}

module.exports = appPromise