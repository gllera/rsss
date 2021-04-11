const configs = {
    max_size_import:  process.env.RSSS_MAX_SIZE_IMPORT  || '500000',
    port:             process.env.RSSS_PORT             || '3000',
    fetcher_sleep:    process.env.RSSS_FETCHER_SLEEP    || '1000',
    fetcher_interval: process.env.RSSS_FETCHER_INTERVAL || '600000',
    fetcher_timeout:  process.env.RSSS_FETCHER_TIMEOUT  || '10000',
    fetcher_agent:    process.env.RSSS_FETCHER_AGENT    || 'rss-parser',
    gui_rsss:         process.env.RSSS_GUI_RSSS         || 'true',
    gui_graphql:      process.env.RSSS_GUI_GRAPHQL      || 'false',
    db_name:          process.env.RSSS_DB_NAME          || 'sqlite.db',
    db_force:         process.env.RSSS_DB_FORCE         || '',
    default_tuners:   process.env.RSSS_DEFAULT_TUNERS   || '3|del|.feedflare |3|enclosures| |7|readability| |8|minify|',
}

for ( const i of [ 'gui_rsss', 'gui_graphql' ])
    configs[i] = configs[i].toLowerCase() == 'true'

for ( const i of [ 'max_size_import', 'port', 'fetcher_sleep', 'fetcher_interval', 'fetcher_timeout' ]) {
    configs[i] = parseInt(configs[i])

    if (isNaN(configs[i]))
        throw new Error(`Value of environment variable 'RSSS_${i.toUpperCase()}' is not a number.`)
}

console.log('[CONFIGURATIONS]')
console.log(configs)

export default configs