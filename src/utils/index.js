const Parser = require('rss-parser')
const configs = require('./configs')

let _parser = new Parser({
    headers: { 'User-Agent': configs.FETCHER_AGENT },
    customFields: {
        item: [
            ['content:encoded', 'content'],
        ]
    },
    timeout: configs.FETCHER_TIMEOUT,
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