const { importSchema } = require('graphql-import')
const { makeExecutableSchema } = require('graphql-tools')
const typeDefs = importSchema('schema.graphql')
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.cached.Database(':memory:');
let fetcher

db.serialize(function () {
    db.run("CREATE TABLE lorem (info TEXT)");

    var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (var i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();

    db.each("SELECT rowid AS id, info FROM lorem", function (err, row) {
        console.log(row.id + ": " + row.info);
    });
});

db.close();

const resolvers = {
    Query: {
        Feeds: () => {
            return 'gab'
        }
    }
}


// let t = new Fetcher(5000)
// t.on('feed', v => console.log('Recivido de ' + v.feedID + ': ' + v.guid))
// t.add(1, 'https://dev.to/rss')
// t.add(2, 'https://itnext.io/feed')
// t.add(3, 'https://hackernoon.com/feed')
// t.parse()

module.exports = (_fetcher) => {
    fetcher = _fetcher

    return makeExecutableSchema({ typeDefs, resolvers })
}