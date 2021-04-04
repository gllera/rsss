import graphqlFields from 'graphql-fields'
import Debug from 'debug'

import { db } from './db.js'

const debug = Debug('rsss:resolvers')

async function sync(_, opts, __, i) {
    debug(opts)

    const fields = graphqlFields(i)
    await db.feeds.mod(opts.o || {})

    return {
        feeds: fields.feeds ? resolvers.Query.feeds(_, opts) : undefined,
        sources: fields.sources ? resolvers.Query.sources(_, opts) : undefined
    }
}

async function source(_, { o }) {
    debug(o)

    if (o.source_id < 0)
        return await db.sources.del(-o.source_id)

    if (!o.source_id)
        return await db.sources.add(o)

    return await db.sources.mod(o)
}

export const resolvers = {
    Query: { 
        alive: () => 1,
        feeds: async (_, { o }) => await db.feeds.all(o || {}),
        sources: async () => await db.sources.all(),
    },
    Mutation: { sync, source },
}