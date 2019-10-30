let u = require('umbrellajs')

view = u('#_views')
view_cards = u('#cards')
view_template = u('#card-template')
view_sync_btn = u('#sync-btn')
view_load_btn = u('#load-btn')
view_save_btn = u('#save-btn')

view_template.first().removeAttribute('id')

const _me = 'PANEL'
let _on = true
let _views = []

function visibility() {
    const on = db.currentView() == _me

    if (on != _on) {
        if (on)
            view.removeClass('d-none')
        else
            view.addClass('d-none')
    }

    return _on = on
}

function update() {
    if (!visibility())
        return

    _views.forEach(e => e.remove())
    _views = []

    const sources = db.currentSources()

    sources.forEach(e => {
        const card = view_template.clone()
        _views.push(card)

        view_cards.append(card)
        card.removeClass('d-none')

        if (e.source_id)
            card.find('.src-source_id').html(e.source_id)
        if (e.url !== undefined)
            card.find('.src-url').html(e.url)
        if (e.title !== undefined)
            card.find('.src-title').html(e.title)
        if (e.description !== undefined)
            card.find('.src-description').html(e.description)
        if (e.siteUrl !== undefined)
            card.find('.src-siteUrl').html(e.siteUrl)
        if (e.lang !== undefined)
            card.find('.src-lang').html(e.lang)
        if (e.count !== undefined)
            card.find('.src-count').html(e.count)
        if (e.unseen !== undefined)
            card.find('.src-unseen').html(e.unseen)
        if (e.stars !== undefined)
            card.find('.src-stars').html(e.stars)

        card.on('click', () => {
            ctrl.filterFeeds({ source_id: e.source_id })
            ctrl.showFeeds()
        })
    })
}

module.exports = {
    update
}