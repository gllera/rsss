const core = require('.')
const debug = require('debug')('rsss:resolvers')
const _ = require('loadsh')
const async = require('async')
const { Parse, sleep } = require('../utils')

/** @type {core.Database} */
let db

/** @type {core.Fetcher} */
let fetcher

let status = {}

async function addSource(url) {
    let source = await Parse(url)
    let values = []

    values.push(url)
    values.push(source.title)
    values.push(source.description)
    values.push(source.link)
    values.push(source.language)

    let stmt = await db.run(
        'INSERT INTO source ( url, title, description, siteUrl, lang ) VALUES( ?, ?, ?, ?, ? )',
        values
    )

    fetcher.addSource(stmt.lastID, url, source)
    return stmt.lastID
}

const resolvers = {
    Query: {
        Feeds: async (root, { seen, star, source_id }) => {
            let sets = [], values = [], where = ''

            if (seen !== undefined) {
                sets.push('seen = ?')
                values.push(seen)
            }

            if (star !== undefined) {
                sets.push('star = ?')
                values.push(star)
            }

            if (source_id !== undefined) {
                sets.push('source_id = ?')
                values.push(source_id)
            }

            if (sets.length)
                where = 'WHERE ' + sets.join(' AND ')

            return await db.all(`SELECT * FROM feed ${where}`, values)
        },
        Sources: async () => {
            let res = await db.all(`
                SELECT 
                    s.*,
                    COUNT(f1.source_id) AS 'count',
                    COUNT(f2.source_id) AS 'unseen',
                    COUNT(f3.source_id) AS 'stars'
                FROM 
                    source AS s
                        JOIN feed AS f1
                            ON s.source_id = f1.source_id
                        LEFT JOIN feed AS f2
                            ON f1.feed_id = f2.feed_id AND f2.seen = 0
                        LEFT JOIN feed AS f3
                            ON f1.feed_id = f3.feed_id AND f3.star = 1
                GROUP BY s.source_id
            `)

            res.forEach(e => e.err = status[e.source_id])
            return res
        },
        Test: async (root, { url }) => JSON.stringify(await Parse(url)),
    },
    Mutation: {
        modFeed: async (root, { feed_id, seen, star }) => {
            let sets = [], values = []

            if (seen !== undefined) {
                sets.push('seen = ?')
                values.push(seen)
            }

            if (star !== undefined) {
                sets.push('star = ?')
                values.push(star)
            }

            if (!sets.length)
                return 0

            values.push(feed_id)

            let stmt = await db.run(
                `UPDATE feed SET ${sets.join(',')} WHERE feed_id = ?`,
                values
            )

            return stmt.changes
        },
        addSource: async (root, { url }) => await addSource(url),
        addSourceBulk: async (root, { urls }) => {
            let values = {}

            await async.eachSeries(urls, async url => {
                try {
                    let id = await addSource(url)
                    values[url] = id
                } catch (e) {
                    debug(e)
                    values[url] = -1
                }
            })

            return urls.map(e => values[e])
        },
        delSource: async (root, { source_id }) => {
            let stmt = await db.run(
                'DELETE from source WHERE source_id = ?',
                [source_id]
            )

            fetcher.delSource(source_id)
            return stmt.changes
        }
    },
}

async function newFeed(e, err) {

    if (err) {
        status[err.source_id] = err.msg
        return
    }

    debug(`${e.source_id} SAVING`)

    try {
        let query = 'INSERT INTO feed ( guid, url, title, content, date, source_id ) VALUES( ?, ?, ?, ?, ?, ? )'

        let values = [
            e.guid,
            e.link,
            e.title,
            e.content,
            e.date,
            e.source_id
        ]

        await db.run(query, values)
    } catch { }
}

async function init(_db, _fetcher) {
    db = _db, fetcher = _fetcher

    fetcher.on('feed', newFeed)

    let sources = await db.all('SELECT * FROM source')
    async.eachSeries(sources, async e => {
        fetcher.addSource(e.source_id, e.url)
        await sleep(500)
    })

    return resolvers
}

module.exports = init
