const express = require('express')
const logger = require('morgan')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const { graphqlHTTP } = require('express-graphql')
const { loadSchemaSync } = require('@graphql-tools/load')
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader')
const { addResolversToSchema } = require('@graphql-tools/schema')

const resolvers = require('./resolvers')
const startFetcher = require('./rss-fetcher')
const { configs, parseOPML, init } = require('./libs')


async function appPromise() {
    await init()

    let app = express()

    app.use(logger('dev'))
    app.use(cors())
    app.use(fileUpload({
        limits: {
            fileSize: configs.import_upload_max_filesize,
            files: 1,
            fields: 0
        }
    }))


    if (configs.gui_user)
        app.use(express.static('dist'))


    app.post('/rsss/import', async (req, res) => {
        if (!req.files || !req.files.file)
            return res.status(400).json({ err: "File not found at field: file" })

        res.json(await resolvers.Mutation.sourceAddBulk(null, { o: parseOPML(req.files.file) }))
    })


    app.use('/rsss', graphqlHTTP({
        graphiql: configs.gui_graphql,
        schema: addResolversToSchema({
            schema: loadSchemaSync('schema.graphql', { loaders: [new GraphQLFileLoader()] }),
            resolvers,
        })
    }))


    startFetcher()
    return app
}

module.exports = appPromise
