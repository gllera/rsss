const { db } = require('../core')

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

async function Sources () {
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
    addSource(url)
}

async function addSourceBulk(root, { urls }) {
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
}

async function delSource(root, { source_id }) {
    let stmt = await db.run(
        'DELETE from source WHERE source_id = ?',
        [source_id]
    )

    fetcher.delSource(source_id)
    return stmt.changes
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