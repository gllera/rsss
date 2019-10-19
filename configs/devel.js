let configs = require('./prod')

configs.graphql.gui = true
configs.db.path = 'sqlite.devel.db'
configs.db.force = 'last'

module.exports = configs