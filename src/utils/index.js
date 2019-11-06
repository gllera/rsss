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

module.exports = {
    configs,
    sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    },
    xmlStreamToJs,
    streamToRAM,
    Parse: (url) => _parser.parseURL(url),
}