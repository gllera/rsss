const request = require('request')
const parser = require('fast-xml-parser')
const iconv = require('iconv-lite')
const he = require('he')
const configs = require('./configs')

const bIni = Buffer.from('<?xml '), bEnd = Buffer.from('?>')
const regEncRes = /(encoding|charset)\s*=\s*(\S+)/
const regEnc = /encoding\s*=\s*"(\S+)"/

const opts_parser = {
    tagValueProcessor: (val, _) => he.decode(val),
    ignoreAttributes: false,
    attributeNamePrefix: '',
    attrNodeName: '$',
}

const opts_iconv = {
    encoding: null,
    gzip: true,
    strictSSL: false,
    timeout: configs.FETCHER_TIMEOUT,
    headers: { 'User-Agent': configs.FETCHER_AGENT },
}

module.exports = (url) => new Promise((resolve, reject) =>
    request.get(url, opts_iconv, (err, res, body) => {
        if (err)
            return reject(err.message)

        if (res.statusCode != 200)
            return reject(`Invalid response code ${res.statusCode}`)

        const ini = body.indexOf(bIni)
        const end = ini == 0 ? body.indexOf(bEnd) : -1
        const type = res.headers['content-type']

        let enc

        if (end != -1) {
            const reg = body.toString('binary', bIni.length, end).match(regEnc)
            enc = reg ? reg[1] : null
        }

        if (!enc && type) {
            const reg = type.match(regEncRes)
            enc = reg ? reg[2] : null
        }

        const js = parser.parse(iconv.decode(body, enc || 'UTF-8'), opts_parser)

        if (!js.feed && !js.rss)
            return reject(`Invalid RSS format`)

        const items = js.feed ? js.feed.entry : js.rss.channel.item

        resolve(items.map(e => {
            const link = (e.link && e.link.$) ? e.link.$.href : e.link

            return {
                guid: e.guid || e.id || link || '',
                link: link || '',
                title: e.title || '',
                content: e['content:encoded'] || e.description || '',
                date: e.published || e.pubDate || '',
            }
        }))
    })
)