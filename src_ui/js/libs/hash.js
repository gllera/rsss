const get = () => {
    const idx = window.location.hash.indexOf('~') + 1
    return window.location.hash.substring(idx || 1)
}

function setFrom(flr, panel) {
    const arr = [
        panel.view,
        flr.tag ? flr.tag : '',
        flr.source_id ? flr.source_id : '',
        flr.seen ? 'seen' : '',
        flr.star ? 'star' : '',
        flr.asc ? 'asc' : '',
    ]

    window.location.hash = arr.join('~')
}

function parseTo(flr, panel) {
    const arr = window.location.hash.substring(1).split('~')

    panel.view = arr[0] || 'main'
    flr.tag = decodeURIComponent(arr[1]) || undefined
    flr.source_id = parseInt(arr[2]) || undefined
    flr.seen = arr[3] ? undefined : 0
    flr.star = arr[4] ? 1 : undefined
    flr.asc = arr[5] ? 1 : 0
}

module.exports = {
    get,
    setFrom,
    parseTo,
}