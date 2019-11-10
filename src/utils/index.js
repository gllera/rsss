const Parser = require('rss-parser')
const { parseStringPromise } = require('xml2js')
const configs = require('./configs')

let _parser = new Parser({
    headers: { 'User-Agent': configs.FETCHER_AGENT },
    customFields: {
        item: [
            ['content:encoded', 'content'],
        ]
    },
    timeout: configs.FETCHER_TIMEOUT,
    defaultRSS: 2.0,
})

async function xmlStreamToJs(stream) {
    const txt = await streamToRAM(stream)
    return await parseStringPromise(txt)
}

async function streamToRAM(stream) {
    return await new Promise((res, rej) => {
        let txt = ''
        stream.on('data', e => txt += e)
        stream.on('end', e => res(txt))
        stream.on('error', e => rej(e))
    })
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
    sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    },
    xmlStreamToJs,
    streamToRAM,
    getSyncInfo,
    Parse: (url) => _parser.parseURL(url),
}