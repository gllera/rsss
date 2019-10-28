const { fetcher } = require('../core')

async function addSource(url) {
    // let source = await Parse(url)
    let values = []

    values.push(url)
    values.push('') //source.title)
    values.push('') //source.description)
    values.push('') //source.link)
    values.push('') //source.language)

    let stmt = await db.run(
        'INSERT INTO source ( url, title, description, siteUrl, lang ) VALUES( ?, ?, ?, ?, ? )',
        values
    )

    fetcher.addSource(stmt.lastID, url)

    return stmt.lastID
}

async function Sources() {
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
}

async function addSource(root, { o }) {
    o.source_id = await db.sourcesAdd(o)
    fetcher.addSource(o)
    return o.source_id
}

async function delSource(root, { source_id }) {
    return await fetcher.delSource(source_id)
}

async function addSourceBulk(root, { o }) {
    let values = []

    await async.eachSeries(o, async url => {
        try {
            values.push(fetcher.addSource(o))
        } catch (e) {
            debug(e)
            values.push(-1)
        }
    })

    return values
}

module.exports = {
    Query: {
        Sources,
    },
    Mutation: {
        addSource,
        addSourceBulk,
        delSource,
    }
}