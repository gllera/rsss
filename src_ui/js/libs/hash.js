const get = () => window.location.hash.substring(1)

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
    const arr = get().split('~')

    panel.view = arr[0] || 'main'
    flr.tag = decodeURIComponent(arr[1]) || undefined
    flr.source_id = parseInt(arr[2]) || undefined
    flr.seen = arr[3] || undefined
    flr.star = arr[4] || undefined
    flr.asc = arr[5] || undefined
}

module.exports = {
    get,
    setFrom,
    parseTo,
}