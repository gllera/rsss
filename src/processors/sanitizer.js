const sanitizer = require('sanitize-html')

const sanitize_opts = {
    allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', "p", "hr", "pre", "blockquote", "ol", "ul", "li", "dl", "dt", "dd", "figure", "figcaption", "div",
        "a", "em", "strong", "small", "s", "cite", "q", "dfn", "abbr", "time", "code", "var", "samp", "kbd", "sub", "i", "b", "u", "mark", "ruby", "rt", "rp", "bdi", "bdo", "span", "br", "wbr",
        "img", "svg", "math", //"iframe", "embed", "object", "param", "video", "audio", "source", "track", "canvas", "map", "area", 
        "table", "caption", "colgroup", "col", "tbody", "thead", "tfoot", "tr", "td", "th",
    ],
    allowedAttributes: {
        a: ['href'],
        img: ['src'],
    },
    selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
    allowedSchemes: ['http', 'https', 'ftp', 'mailto'],
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: ['href', 'src'],
    allowProtocolRelative: false
}

module.exports = {
    name: 'Sanitizer',
    order: 200,
    process: (e) => {
        e.content = sanitizer(e.content, sanitize_opts)
        return e
    }
}