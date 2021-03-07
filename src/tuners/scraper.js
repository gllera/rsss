// Description: Extracts feed's content from its url.

import axios from 'axios'
import configs from '../libs/configs.js'

const instance = axios.create({
    timeout: configs.fetcher_timeout,
    headers: { 'User-Agent': configs.fetcher_agent }
})

export default async (e, p) => {
    const res = await instance.get(e.link)

    if (res.status != 200)
        throw `Got response code "${res.status}"`

    if (!res.data)
        throw "Got empty response"

    e.content = res.data
}