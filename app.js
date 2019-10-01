const express = require('express')
const logger = require('morgan')
const graphqlHTTP = require('express-graphql')
const fetcher = require('./core/fetcher')({ interval: 5000 })
const schema = require('./core/graphql-schema')(fetcher)

let app = express()

app.use(logger('dev'))
app.use('/', graphqlHTTP({
    schema: schema,
    graphiql: true,
}))

module.exports = app
