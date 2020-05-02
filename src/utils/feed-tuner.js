const debug = require('debug')('rsss:tuner')
const fs = require('fs')
const path = require('path')
const configs = require('./configs')

const tuners = {}, tunersStrOrder = {}

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

function parseTunersStr(tunersStr) {
    let defaults = JSON.parse(configs.tuners_default)
    let current = tunersStr ? JSON.parse(tunersStr) : {}
    let params = { ...defaults, ...current }
    let order = []

    for (let i = 0; i < 10; i++)
        for (let j in params)
            if (params[j].z === i)
                order.push({
                    id: j,
                    params: params[j]
                })

    return order
}

async function tuneFeed(tunersStr, feed) {
    tunersStr = tunersStr || ""

    let order = tunersStrOrder[tunersStr]

    if (order === undefined)
        order = tunersStrOrder[tunersStr] = parseTunersStr(tunersStr)

    order.forEach(e => {
        debug(feed.source_id, e.id)
        tuners[e.id](feed, e.params)
    })
}

module.exports = { initFeedTuner, tuneFeed }