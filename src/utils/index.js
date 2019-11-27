const parseRSS = require('./rss-parser')
const configs = require('./configs')
const importer = require('./importer')

function getSyncInfo(s) {
    const upd = {
        seen: [],
        unseen: [],
        star: [],
        unstar: []
    }

    if (s && s.seen)
        s.seen.forEach(e => {
            if (e > 0)
                upd.seen.push(e)
            else
                upd.unseen.push(-e)
        })

    if (s && s.star)
        s.star.forEach(e => {
            if (e > 0)
                upd.star.push(e)
            else
                upd.unstar.push(-e)
        })

    return upd
}

module.exports = {
    importer,
    configs,
    getSyncInfo,
    parseRSS,
    sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
}