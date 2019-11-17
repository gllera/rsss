const debug = require('debug')('rsss:processor')
const fs = require('fs')
const path = require('path')
const procs = {}

function includePath(p) {
    fs.readdirSync(p).forEach(i => {
        const f = path.resolve(p, i)
        const m = require(f)

        if (!m || !m.name || !m.order || !m.process)
            throw (`Invalid processor file: ${f}`)

        if (!procs[m.order])
            procs[m.order] = []

        procs[m.order].push(m)
        debug(`Added processor: ${m.name}`)
    })
}

includePath(path.resolve(__dirname, '..', 'processors'))

if (fs.existsSync('data/processors'))
    includePath(path.resolve(__dirname, '..', '..', 'data', 'processors'))

console.log('PROCESSING PATHS:')
for (let i in procs)
    console.log(`${i} -> ${procs[i].map(o => o.name)}`)

module.exports = (e) => {
    for (let i in procs)
        procs[i].forEach(j => {
            debug(`${e.source_id} USING "${j.name}"`)
            e = j.process(e)
            debug(`${e.source_id} DONE`)
        })

    return e
}