const { db, importer } = require('./libs')
const views = require('./views')

const panel = {
    sync_hash: '',
    view: 'main',
    idx: {},
}, filter = {
    source_id: undefined,
    tag: undefined,
    star: undefined,
    asc: 0,
    seen: 0,
}, empty_feed = {
    star: 0,
    title: '',
    content: '',
    link: '',
}

const filter_hash = () => [ filter.tag || '', filter.source_id || '', filter.seen || '', filter.star || '', filter.asc || '' ].join('~')
const next = (delta = 1) => show({idx: (panel.idx[filter_hash()] || 0) + delta})
const cards_callback = e => show({
    _source_id: 1,
    source_id: e.source_id,
    view: e.source_id || filter.tag == e.tag ? 'feed' : undefined,
    _tag: !e.source_id,
    tag: e.tag,
})

function show(opts) {
    let { view, seen, _seen, star, _star, tag, _tag, source_id, _source_id, asc, idx } = opts || {}

    _seen = _seen && seen !== filter.seen
    _star = _star && star !== filter.star
    _tag  = _tag  && tag  !== filter.tag
    _source_id = _source_id && source_id !== filter.source_id

    if (_seen) filter.seen = seen
    if (_star) filter.star = star
    if (_tag)  filter.tag  = tag
    if (_source_id) filter.source_id = source_id

    if (asc !== undefined)
        filter.asc = asc

    const hash = filter_hash()

    if (idx !== undefined) {
        const count = db.feeds_count(hash)
        if (idx < 0) idx = 0
        if (idx > count) idx = count - 1
        if (panel.idx[hash] !== idx) {
            panel.idx[hash] = idx
            window.scrollTo(0, 0)
        }
    }

    if (view) {
        panel.view = view
        window.scrollTo(0, 0)

        for (const i of Object.keys(views))
            if (i == view)
                views[i].$.removeAttr('style')
            else
                views[i].$.attr('style', 'display: none')
    }

    switch (panel.view) {
        case 'main':
            const filtered = db.sources().filter(e => (!filter.tag || e.tag == filter.tag) && (!filter.star || e.stars))
            return views['main'].update(filtered, filter.source_id, filter.tag, db.tags(), e => cards_callback(e))
        case 'feed':
            return views['feed'].update(db.feed(hash, panel.idx[hash]) || empty_feed)
    }
}

function toggle(key) {
    const value = { seen: 0, star: 1 }

    switch (panel.view) {
    case 'main':
        return show({
            [key]: filter[key] !== value[key] ? value[key] : undefined,
            ['_' + key]: 1,
        })
    case 'feed':
        const hash = filter_hash()
        const e = db.feed(hash, panel.idx[hash])
        if (e) e[key] = !e[key]
        return show()
    }
}

module.exports = {
    import: () => importer(),
    prev: () => next(-1),
    sync: () => db.sync(filter, filter_hash()).then(show).catch(alert),
    toggle,
    next,
    show,
}


    // hash_changed,
// function hash_changed() {
//     hash.parseTo(filter, panel)
//     refresh()
// }
// if (hash.get() == '')
//     hash.setFrom(filter, panel)
// else
//     hash.parseTo(filter, panel)
