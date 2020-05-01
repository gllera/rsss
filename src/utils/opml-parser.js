const parseXML = require('fast-xml-parser').parse

const opts_parser = {
    ignoreAttributes: false,
    attributeNamePrefix: '',
    attrNodeName: '$',
}

function parseJsImport(o, res, tag) {
    if (o.$ && o.$.type == 'rss')
        if (res[o.$.xmlUrl] === undefined)
            res[o.$.xmlUrl] = {
                title: o.$.title,
                xml_url: o.$.xmlUrl,
                html_url: o.$.htmlUrl,
                tag
            }

    tag = o.$ && o.$.title ? o.$.title : tag

    if (Array.isArray(o.outline))
        o.outline.forEach(e => parseJsImport(e, res, tag))
}

module.exports = file => {
    const txt = parseXML(file.data.toString(), opts_parser)

    const RSSs = {}
    const res = []

    if (txt && txt.opml && txt.opml.body && Array.isArray(txt.opml.body.outline))
        txt.opml.body.outline.forEach(e => parseJsImport(e, RSSs))

    for (let e in RSSs)
        res.push(RSSs[e])

    return res
}
