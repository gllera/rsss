import request from 'request'
import parser from 'fast-xml-parser'
import iconv from 'iconv-lite'
import he from 'he'
import configs from './configs.js'

const bIni = Buffer.from('<?xml '), bEnd = Buffer.from('?>')
const regEncRes = /(encoding|charset)\s*=\s*(\S+)/
const regEnc = /encoding\s*=\s*"(\S+)"/

const toParse = ['description', 'content:encoded', 'content', 'title', 'summary']
const opts_parser = {
    tagValueProcessor: (val, tag) => toParse.includes(tag) ? he.decode(val) : val,
    ignoreAttributes: false,
    attributeNamePrefix: '$',
    textNodeName: '$$',
    arrayMode: true,
}

const opts_iconv = {
    encoding: null,
    strictSSL: false,
    timeout: configs.fetcher_timeout,
    headers: { 'User-Agent': configs.fetcher_agent },
}

const extVal = e => e == null ? '' : Array.isArray(e) ? extVal(e[0]) : typeof e == 'object' ? e.$$ : e

export default (xml_url) => new Promise((resolve, reject) =>
    request.get(xml_url, opts_iconv, (err, res, body) => {
        let enc, items

        if (err)
            return reject(err.message)

        if (res.statusCode != 200)
            return reject(`Invalid response code ${res.statusCode}`)

        const ini = body.indexOf(bIni)
        const end = ini == 0 ? body.indexOf(bEnd) : -1
        const type = res.headers['content-type']

        if (end != -1) {
            const reg = body.toString('binary', bIni.length, end).match(regEnc)
            enc = reg ? reg[1] : null
        }

        if (!enc && type) {
            const reg = type.match(regEncRes)
            enc = reg ? reg[2] : null
        }

        const js = parser.parse(iconv.decode(body, enc || 'UTF-8'), opts_parser)

        if (js.feed)
            items = js.feed[0].entry
        else if (js.rss)
            items = js.rss[0].channel[0].item
        else if (js['rdf:RDF'])
            items = js['rdf:RDF'][0].item
        else
            return reject(`Invalid RSS format`)

        items = items
            .filter(e => {
                if (!e.link)
                    return false

                if (!Array.isArray(e.link))
                    return true

                e.link = e.link
                    .filter(i => typeof i != 'object' || i.$rel == "alternate")
                    .map(i => typeof i != 'object' ? i : i.$href)

                return e.link.length
            })
            .map(e => ({
                guid: extVal(e.guid || e.id || e.link),
                link: extVal(e.link),
                title: extVal(e.title),
                content: extVal(e['content:encoded'] || e.content || e.description || e.summary),
                date: extVal(e.published || e.pubDate || e.updated || e['dc:date']),
            }))

        resolve(items)
    })
)