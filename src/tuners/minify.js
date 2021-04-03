// Description: Removes unnecessary stuff from feed content.

import { minify } from 'html-minifier'

const minify_opts = {
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeEmptyElements: true,
    //removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    trimCustomFragments: true,
    useShortDoctype: true,
    html5: true
}

export default e => {
    let node = e.doc.body

    while ( node.childElementCount == 1 && node.childNodes[0].nodeValue === null )
        node = node.childNodes[0]

    e.doc.body.innerHTML = minify(node.innerHTML, minify_opts)
}