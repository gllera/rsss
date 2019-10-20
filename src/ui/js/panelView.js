let u = require('umbrellajs')
let ctrl = require('./controller')

class TagView {
    constructor(opts) {
        this._card = opts.card

        if (opts.source_id)
            this._card.find('.src-source_id').html(opts.source_id)
        if (opts.url !== undefined)
            this._card.find('.src-url').html(opts.url)
        if (opts.title !== undefined)
            this._card.find('.src-title').html(opts.title)
        if (opts.description !== undefined)
            this._card.find('.src-description').html(opts.description)
        if (opts.siteUrl !== undefined)
            this._card.find('.src-siteUrl').html(opts.siteUrl)
        if (opts.lang !== undefined)
            this._card.find('.src-lang').html(opts.lang)
        if (opts.count !== undefined)
            this._card.find('.src-count').html(opts.count)
        if (opts.unseen !== undefined)
            this._card.find('.src-unseen').html(opts.unseen)
        if (opts.stars !== undefined)
            this._card.find('.src-stars').html(opts.stars)            

        this._card.on('click', () => {
            ctrl.filterFeeds({ source_id: opts.source_id })
            ctrl.showFeeds()
        })
    }

    remove() {
        this._card.remove()
    }
}

class PanelView {
    constructor() {
        this._sources = []
        this._view = u('#panel')
        this._sync = u('#sync-btn')
        this._load = u('#load-btn')
        this._save = u('#save-btn')
        this._cards = u('#cards')
        this._template = u('#card-template')
        this._template.first().removeAttribute('id')
    }

    update(sources, err) {
        this._sources.forEach(e => e.remove())
        this._sources = []

        sources.forEach(e => {
            let card = this._template.clone()
            card.removeClass('d-none')

            this._cards.append(card)
            this._sources.push(new TagView({
                ...e,
                card
            }))
        })

    }

    show() {
        this._view.removeClass('d-none')
    }

    hide() {
        this._view.addClass('d-none')
    }
}

module.exports = () => new PanelView()