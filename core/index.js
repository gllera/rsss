const db = require('./db')
const fetcher = require('./fetcher')
const procesor = require('./procesor')
const resolvers = require('./resolvers')

/** @typedef {db.Database} Database */
/** @typedef {fetcher.Fetcher} Fetcher */

module.exports = { db, fetcher, procesor, resolvers }