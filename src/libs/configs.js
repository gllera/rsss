import fs from 'fs'
import yaml from 'js-yaml'
import _ from 'loadsh'

const configs_base = yaml.load(fs.readFileSync('config.yaml', 'utf8'))
const configs_user = fs.existsSync('data/config.yaml') ? yaml.load(fs.readFileSync('data/config.yaml', 'utf8')) : {}
const configs = _.defaultsDeep(configs_base, configs_user)

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
            case 'object':
                configs[e] = JSON.parse(process.env[e])
                break
        }

console.log('[CONFIGURATIONS]')
console.log(yaml.dump(configs, { sortKeys: true, lineWidth: 1000 }))

export default configs
