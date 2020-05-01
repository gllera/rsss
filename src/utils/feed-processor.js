const debug = require('debug')('rsss:processor')
const fs = require('fs')
const path = require('path')

const processors = {}

function includePath(folder) {
    fs.readdirSync(folder).forEach(i => {
        const full_path = path.resolve(folder, i)
        const name = path.parse(full_path).name

        processors[name] = require(full_path)

        if (typeof processors[name] !== "function")
            throw (`Invalid processor file: ${full_path}`)

        debug('Found', full_path)
    })
}

function initFeedProcessor(configs) {
    includePath('src/processors')

    if (fs.existsSync('data/processors'))
        includePath('data/processors')
}

async function processFeed(source, feed) {
    function parseList(source_list) {
        //configs.fetcher_default_processors
    }
}

module.exports = { initFeedProcessor, processFeed }