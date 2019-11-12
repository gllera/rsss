let feed, sources, model

const filter_values = {
    seen: [0, undefined],
    star: [1, undefined],
}

function update() {
    sources.update()
    feed.update()
}

function fetch() {
    const _fetch = model.view() == feed.me() ? model.fetchFeeds : model.fetchSources
    return _fetch()
        .then(() => update())
        .catch(e => alert(JSON.stringify(e)))
}

function toggle(k) {
    if (model.view() != feed.me()) {
        const v = model.filter()[k]
        const idx = (filter_values[k].indexOf(v) + 1) % filter_values[k].length

        model.filter({ [k]: filter_values[k][idx] })
        sources.update()
    } else
        model.modFeed(model.feed(), k)
}

function nextFeed(amt) {
    if (model.view() == feed.me()) {
        model.nextFeed(amt)
        update()
    }
}

module.exports = {
    init: (_feed, _sources, _model) => {
        feed = _feed
        sources = _sources
        model = _model
    },
    show: (v) => {
        model.view(v)
        update()
    },
    next: () => nextFeed(1),
    prev: () => nextFeed(-1),
    fetch,
    toggle,
}
