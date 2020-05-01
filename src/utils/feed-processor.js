const debug = require('debug')('rsss:processor')
const fs = require('fs')
const path = require('path')

const tuners = {}

function includePath(folder) {
    fs.readdirSync(folder).forEach(i => {
        const full_path = path.resolve(folder, i)
        const name = path.parse(full_path).name

        tuners[name] = require(full_path)

        if (typeof tuners[name] !== "function")
            throw (`Invalid tuner file: ${full_path}`)

        debug('Found', full_path)
    })
}

function initFeedProcessor(configs) {
    includePath('src/tuners')

    if (fs.existsSync('data/tuners'))
        includePath('data/tuners')
}

function parseTunersStr() {

}

async function processFeed(feed) {
    function parseList(source_list) {
        //configs.fetcher_default_processors
    }
}

module.exports = { initFeedProcessor, processFeed }