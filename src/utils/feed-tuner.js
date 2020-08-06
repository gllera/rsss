const debug = require('debug')('rsss:tuner')
const fs = require('fs')
const path = require('path')
const configs = require('./configs')

const tuners = {}, tunersStrOrder = {}
const sorter = (a, b) => (a.z === undefined ? 99 : a.z) - (b.z === undefined ? 99 : b.z)

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

function initFeedTuner(configs) {
    includePath('src/tuners')

    if (fs.existsSync('data/tuners'))
        includePath('data/tuners')
}

async function tuneFeed(tunersStr, feed) {
    tunersStr = tunersStr || ""
    let order = tunersStrOrder[tunersStr]

    if (order === undefined) {
        const defaults = configs.tuners_default
        let current = tunersStr ? JSON.parse(tunersStr) : []

        defaults.forEach(i => {
            if (!i.params)
                i.params = []
        })

        current = current.map(i => {
            const e = i.split('|')
            return {
                name: e[0],
                z: e[1] ? parseInt(e[1]) : undefined,
                params: e.slice(2)
            }
        })

        order = tunersStrOrder[tunersStr] = defaults.concat(current).sort(sorter)
    }

    for (const e of order) {
        debug(feed.source_id, e.name)
        await tuners[e.name](feed, e.params)
    }
}

module.exports = { initFeedTuner, tuneFeed }