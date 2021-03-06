// Description: Edit feed content.

import $ from 'cheerio'

export default (e, p) => {
    let data = $.load(e.content).root()
    let task = undefined

    for (const i of p)
        switch (i) {
            case '##crop##':
                task = e => data = data.find(e).first()
                break
            case '##del##':
                task = e => data.find(e).remove()
                break
            default:
                task(i)
        }

    e.content = data.html()
}