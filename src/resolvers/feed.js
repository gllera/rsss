const { db } = require('../core')

async function feeds(root, { o }) {
    let sets = [], values = [], where = ''

    if (o) {
        if (o.seen !== undefined) {
            sets.push('seen = ?')
            values.push(o.seen)
        }

        if (o.star !== undefined) {
            sets.push('star = ?')
            values.push(o.star)
        }

        if (o.source_id !== undefined) {
            sets.push('source_id = ?')
            values.push(o.source_id)
        }
    }

    if (sets.length)
        where = 'WHERE ' + sets.join(' AND ')

    return await db().all(`SELECT * FROM feed ${where}`, values)
}

async function modFeed (root, { o }) {
    let sets = [], values = []

    if (o.seen !== undefined) {
        sets.push('seen = ?')
        values.push(o.seen)
    }

    if (o.star !== undefined) {
        sets.push('star = ?')
        values.push(o.star)
    }

    if (!sets.length)
        return 0

    values.push(o.feed_id)

    let stmt = await db.run(
        `UPDATE feed SET ${sets.join(',')} WHERE feed_id = ?`,
        values
    )

    return stmt.changes
}

module.exports = {
    Query: {
        feeds
    },
    Mutation: {
        modFeed
    }
}