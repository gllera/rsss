// Description: Extracts feed's content from its url.

const request = require('request')
const $ = require('cheerio')
const { configs } = require('../utils')

const opts_iconv = {
    encoding: 'UTF-8',
    strictSSL: false,
    timeout: configs.fetcher_timeout,
    headers: { 'User-Agent': configs.fetcher_agent },
}

// function process() {
//     return
//     return new Promise((resolve, reject) => {
//         request.get(e.link, opts_iconv, (err, res, body) => {
//             e.content = $('.entry', body).html()
//             resolve()
//         })
//     })
// }

module.exports = e => null