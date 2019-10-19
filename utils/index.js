const Parser = require('rss-parser')
const _ = require('loadsh')
const configs = require('../configs')

let _parser = new Parser({
    headers: { 'User-Agent': configs.fetcher.agent },
    customFields: {
        item: [
            ['content:encoded', 'content'],
        ]
    },
    timeout: configs.fetcher.timeout,
    defaultRSS: 2.0,
})

module.exports = {
    configs,
    sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    },
    Parse: (url) => _parser.parseURL(url),
}