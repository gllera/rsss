const request = require('request')
const $ = require('cheerio')
const { configs } = require('../utils')

const opts_iconv = {
    encoding: 'UTF-8',
    strictSSL: false,
    timeout: configs.FETCHER_TIMEOUT,
    headers: { 'User-Agent': configs.FETCHER_AGENT },
}

module.exports = {
    name: 'Scraper',
    order: 100,
    process: e => {
        return
        return new Promise((resolve, reject) => {
            request.get(e.link, opts_iconv, (err, res, body) => {
                e.content = $('.entry', body).html()
                resolve()
            })
        })
    }
}