import { Database, open } from 'sqlite'
import sqlite3 from 'sqlite3'
import Debug from 'debug'

import configs from './libs/configs.js'

const debug = Debug('rsss:db')

/** @typedef {Database} Database */
/** @type {Database} */
let DB

process.on('exit', () => { if (DB) DB.close() })
process.on('SIGHUP', () => process.exit(128 + 1))
process.on('SIGINT', () => process.exit(128 + 2))
process.on('SIGTERM', () => process.exit(128 + 15))

async function source_pop() {
    const source = await DB.get('SELECT * FROM source WHERE last_fetch < ? ORDER BY last_fetch LIMIT 1', [Date.now() - configs.fetcher_interval])

    if (source)
        await DB.run('UPDATE source SET last_fetch = ? WHERE source_id = ?', [Date.now(), source.source_id])

    return source
}

async function source_add(o) {
    const keys = Object.keys(o)
    const fields = Array(keys.length).fill('?')
    const res = await DB.run(`INSERT INTO source ( ${keys.join(',')} ) VALUES( ${fields.join(',')} )`, Object.values(o))

    return res.lastID
}

async function source_mod(id, o) {
    const keys = Object.keys(o).map(i => `${i} = ?`)
    const res = await DB.run(`UPDATE source SET ${keys.join(',')} WHERE source_id = ${id}`, Object.values(o))

    return res.changes
}

async function feed_add(o) {
    const keys = Object.keys(o)
    const fields = Array(keys.length).fill('?')
    const res = await DB.run(`INSERT INTO feed ( ${keys.join(',')} ) VALUES( ${fields.join(',')} )`, Object.values(o))

    return res.lastID
}

async function feeds(o, last_id, asc = 0, limit = 50) {
    const keys = Object.keys(o).map(i => i === 'tag' ? `s.tag = ?` : `f.${i} = ?`)
    if (last_id != undefined) keys.push(`f.feed_id ${asc ? '>' : '<'} ${last_id}`)

    return await DB.all(`SELECT f.* FROM feed as f LEFT JOIN source AS s ON f.source_id = s.source_id ${keys.length ? 'WHERE ' + keys.join(' AND ') : ''} ORDER BY f.date ${asc ? 'asc' : 'desc'} LIMIT ${limit}`, Object.values(o))
}

export const db = {
    sources: {
        columns: ['source_id', 'xml_url', 'html_url', 'title', 'tag', 'lang', 'tuners', 'description'],
        all: async () => await DB.all('SELECT * FROM source_view'),
        del: async id => (await DB.run(`DELETE FROM source WHERE source_id = ${id}`)).changes,
        add: source_add,
        pop: source_pop,
        mod: source_mod
    },
    feeds: {
        columns: ['feed_id', 'source_id', 'guid', 'link', 'title', 'content', 'date', 'seen', 'star'],
        old: async guid => await DB.get('SELECT * FROM feed WHERE guid = ?', [guid]) !== undefined,
        seen: async (feeds, val = 1) => await DB.run(`UPDATE feed SET seen = ${val} WHERE feed_id in (${feeds.join(',')})`),
        star: async (feeds, val = 1) => await DB.run(`UPDATE feed SET star = ${val} WHERE feed_id in (${feeds.join(',')})`),
        all: feeds,
        add: feed_add,
    },
}

export async function initDB() {
    DB = await open({
        filename: 'data/' + configs.db_name,
        driver: sqlite3.cached.Database
    })

    await DB.migrate({ force: configs.db_force })
    await DB.get("PRAGMA foreign_keys = ON")
}
