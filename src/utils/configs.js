const fs = require('fs')
const yaml = require('js-yaml')
const _ = require('loadsh')
let configs = {}

let _conf_loader = (path) => configs = _.defaultsDeep(yaml.safeLoad(fs.readFileSync(path, 'utf8')), configs)

_conf_loader('config.yaml')

if (fs.existsSync('data/config.yaml'))
    _conf_loader('data/config.yaml')

for (let e in configs)
    if (process.env[e] !== undefined)
        switch (typeof configs[e]) {
            case 'string':
                configs[e] = process.env[e]
                break
            case 'number':
                configs[e] = parseInt(process.env[e])
                break
            case 'boolean':
                configs[e] = (process.env[e].toLowerCase() == 'true')
                break
        }

console.log('[CONFIGURATIONS]')
console.log(yaml.safeDump(configs, { sortKeys: true, lineWidth: 1000 }))

module.exports = configs