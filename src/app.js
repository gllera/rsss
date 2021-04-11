import express from 'express'
import logger from 'morgan'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import { graphqlHTTP } from 'express-graphql'
import { loadSchemaSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { addResolversToSchema } from '@graphql-tools/schema'

import configs from './libs/configs.js'
import parseOPML from './libs/opml_parser.js'

import { resolvers } from './gql_resolvers.js'
import { initTuners } from './tuner.js'
import { startFetching } from './fetcher.js'
import { initDB } from './db.js'

export async function appPromise() {
    await initTuners()
    await initDB()

    let app = express()

    app.use(logger('dev'))
    app.use(cors())
    app.use(fileUpload({
        limits: {
            fileSize: configs.max_size_import,
            files: 1,
            fields: 0
        }
    }))


    if (configs.gui_rsss)
        app.use(express.static('dist'))


    app.post('/rsss/import', async (req, res) => {
        if (!req.files || !req.files.file)
            return res.status(400).json({ err: "File not found at field: file" })

        const results = []

        for (const i of parseOPML(req.files.file))
            try {
                results.push(await resolvers.Mutation.source(null, { o: i }))
            }
            catch (e) {
                results.push(e.message)
            }

        res.json(results)
    })


    app.use('/rsss', graphqlHTTP({
        graphiql: configs.gui_graphql,
        schema: addResolversToSchema({
            schema: loadSchemaSync('schema.graphql', { loaders: [new GraphQLFileLoader()] }),
            resolvers,
        })
    }))


    startFetching()
    return app
}
