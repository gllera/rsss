import Debug from 'debug'
import fs from 'fs'
import path from 'path'

import configs from './libs/configs.js'

const debug = Debug('rsss:tuner')
const tunersOrder = {}
const tuners = {

}

function includePath(folder) {
    fs.readdirSync(folder).forEach(async i => {
        const full_path = path.resolve(folder, i)
        const name = path.parse(full_path).name

        tuners[name] = (await import(full_path)).default

        if (typeof tuners[name] !== "function")
            throw (`Invalid tuner file: ${full_path}`)

        debug('Found', full_path)
    })
}

export function initTuners() {
    includePath('src/tuners')

    if (fs.existsSync('data/tuners'))
        includePath('data/tuners')
}

export async function tune(feed, tunersStr) {
    let order = tunersOrder[tunersStr]

    if (!order) {
        order = tunersOrder[tunersStr] = []
        const arr = format(configs.default_tuners, tunersStr).split('|')

        for (let i = 0; i < arr.length; i += 3)
            order.push({
                name: arr[i + 1],
                param: arr[i + 2],
            })
    }

    for (const e of order) {
        debug(feed.source_id, e.name)
        await tuners[e.name](feed, e.param)
    }
}

export function format() {
    const order = {}, res = []

    for (let i = 0; i < arguments.length; i++) {
        const tuners = arguments[i].replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ')

        if (tuners === '')
            continue

        const fields = tuners.split('|')

        if (fields.length % 3)
            throw new Error('Invalid tuners specification')

        for (let j = 0; j < fields.length; j += 3) {
            let idx = fields[j].trim()

            if (!order.hasOwnProperty(idx))
                order[idx] = []

            order[idx].push(idx, fields[j + 1].trim(), fields[j + 2].trim())
        }
    }

    for (const i of Object.keys(order).sort())
        for (const j of order[i])
            res.push(j)

    return res.join('|')
}
