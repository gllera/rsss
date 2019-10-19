let configs = {}

configs.graphql = {}
configs.graphql.port = 3000
configs.graphql.gui = false

configs.db = {}
configs.db.path = 'sqlite.db'
configs.db.force = false
configs.db.cached = true

configs.fetcher = {}
configs.fetcher.interval = 30000
configs.fetcher.timeout = 10000
configs.fetcher.agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36'

module.exports = configs