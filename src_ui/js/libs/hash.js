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

    panel.view = arr[0]
    flr.tag = arr[1] ? decodeURIComponent(arr[1]) : undefined
    flr.source_id = arr[2] ? arr[2] : undefined
    flr.seen = arr[3] == 'seen'
    flr.star = arr[4] == 'star'
    flr.asc = arr[5] == 'asc'
}

module.exports = {
    get,
    setFrom,
    parseTo,
}