#!/usr/bin/env node

/**
 * Module dependencies.
 */

import { appPromise } from '../app.js'
import Debug from 'debug'
import http from 'http'
import { configs } from '../libs/index.js'

const debug = Debug('rsss:server')

let port, server

async function start() {
    let app = await appPromise()

    port = configs.port
    app.set('port', port)

    server = http.createServer(app)
    server.listen(port)
    server.on('error', onError)
    server.on('listening', onListening)
}

start()

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges')
            process.exit(1)
            break
        case 'EADDRINUSE':
            console.error(bind + ' is already in use')
            process.exit(1)
            break
        default:
            throw error
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    let addr = server.address()
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port
    debug('Listening on ' + bind)
}
