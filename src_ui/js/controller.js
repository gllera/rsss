let feed, sources, model

function update(h) {
    if (h)
        model.hash(h)
    else
        window.location.hash = model.hash()

    sources.update()
    feed.update()
}

function fetch(v = model.view()) {
    const _fetch = v ? model.fetchFeeds : model.fetchSources

    return _fetch()
        .then(() => update())
        .catch(e => alert(JSON.stringify(e)))
}

function toggle(k) {
    if (model.view() != feed.me()) {
        model.filter({ [k]: model.filter()[k] ? 0 : 1 })
        update()
    } else
        model.modFeed(model.feed(), k)
}

function nextFeed(amt) {
    if (model.view() == feed.me()) {
        window.scrollTo(0, 0)
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
        window.scrollTo(0, 0)
        model.view(v)
        update()

        if (!model.feed())
            fetch()
    },
    next: () => nextFeed(1),
    prev: () => nextFeed(-1),
    fetch,
    toggle,
    update,
}
