import * as graphqlFields from 'graphql-fields'
import Debug from 'debug'
const debug = Debug('rsss:resolvers')
import { db } from './libs/db.js'

async function Sync(_, { o }, __, i) {
    debug(o)

    const fields = graphqlFields(i)
    const res = {}
    o = o || {}

    await db.feeds.mod(o)

    if (fields.sources)
        res.sources = await db.sources.all()

    if (fields.feeds)
        res.feeds = await db.feeds.all(o)

    return res
}

async function Source(_, { o }) {
    debug(o)

    if (o.source_id < 0)
        return await db.sources.del(-o.source_id)

    if (!o.source_id)
        return await db.sources.add(o)

    return await db.sources.mod(o)
}

export const resolvers = {
    Query: { alive: () => 1 },
    Mutation: { Sync, Source },
}