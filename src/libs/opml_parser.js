import { parse as parseXML } from 'fast-xml-parser'

const opts_parser = {
    ignoreAttributes: false,
    attributeNamePrefix: '',
    attrNodeName: '$',
}

function parseJsImport(o, res, tag) {
    if (!o)
        return

    if (Array.isArray(o))
        return o.forEach(e => parseJsImport(e, res, tag))

    if (o.$ && o.$.type == 'rss')
        if (res[o.$.xmlUrl] === undefined)
            res[o.$.xmlUrl] = {
                title: o.$.title,
                xml_url: o.$.xmlUrl,
                html_url: o.$.htmlUrl,
                tag
            }

    parseJsImport(o.outline, res, o.$ && o.$.title ? o.$.title : tag)
}

export default file => {
    const txt = parseXML(file.data.toString(), opts_parser)

    const RSSs = {}
    const res = []

    if (txt && txt.opml && txt.opml.body)
        parseJsImport(txt.opml.body.outline, RSSs)

    for (let e in RSSs)
        res.push(RSSs[e])

    return res
}
