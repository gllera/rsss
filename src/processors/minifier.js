const { minify } = require('html-minifier')

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

module.exports = {
    name: 'Minifier',
    order: 800,
    process: (e) => {
        e.content = minify(e.content, minify_opts)
        return e
    }
}