const parseXML = require('fast-xml-parser').parse
const parseRSS = require('./rss-parser')
const configs = require('./configs')

const opts_parser = {
    ignoreAttributes: false,
    attributeNamePrefix: '',
    attrNodeName: '$',
}

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
    configs,
    getSyncInfo,
    parseRSS,
    sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
    xmlStreamToJs: s => new Promise((res, rej) => {
        let xml = ''
        s.on('data', e => xml += e)
        s.on('end', e => res(xml))
        s.on('error', e => rej(e))
    }).then(e => parseXML(e, opts_parser)),
}