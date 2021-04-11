import graphqlFields from 'graphql-fields'
import Debug from 'debug'

import { db } from './db.js'
import { format } from './tuner.js'

const debug = Debug('rsss:resolvers')

 async function sync(_, { o, s }, __, i) {
    debug('sync', o = o || {})
    const fields = graphqlFields(i)

    if (s) {
        if (s.seen   && s.seen.length)   await db.feeds.seen(s.seen)
        if (s.star   && s.star.length)   await db.feeds.star(s.star)
        if (s.unseen && s.unseen.length) await db.feeds.seen(s.unseen, 0)
        if (s.unstar && s.unstar.length) await db.feeds.star(s.unstar, 0)
    }

    return {
        feeds: fields.feeds ? resolvers.Query.feeds(_, { o }) : undefined,
        sources: fields.sources ? resolvers.Query.sources() : undefined
    }
}

async function source(_, { o }) {
    debug('source', o = o || {})

    if (o.source_id < 0)
        return await db.sources.del(-o.source_id)

    if (o.tuners != undefined)
        o.tuners = format(o.tuners)

    if (!o.source_id)
        return await db.sources.add(o)

    return await db.sources.mod(o)
}

async function feeds(_, { o }) {
    debug('feeds', o = o || {})
    const { last_id, asc, limit } = o

    delete o.last_id
    delete o.asc
    delete o.limit

    return await db.feeds.all(o, last_id, asc, limit)
}

async function sources() {
    debug('sources')
    return await db.sources.all()
}

export const resolvers = {
    Query: { alive: () => 1, feeds, sources },
    Mutation: { sync, source },
}