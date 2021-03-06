import express from 'express'
import logger from 'morgan'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import { graphqlHTTP } from 'express-graphql'
import { loadSchemaSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { addResolversToSchema } from '@graphql-tools/schema'

import { resolvers } from './resolvers.js'
import { startFetching } from './rss-fetcher.js'
import { configs, parseOPML, init } from './libs/index.js'

export async function appPromise() {
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


    startFetching()
    return app
}
