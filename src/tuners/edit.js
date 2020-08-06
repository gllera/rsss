// Description: Edit feed content.

const $ = require('cheerio')

module.exports = (e, p) => {
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