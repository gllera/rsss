const u = require('umbrellajs')
const { db, visibility } = require('../utils')
const ctrl = require('../controller')

const view = u('#sources')
const view_cards = u('#cards')
const view_template = u('.scard')

const state = {
    me: 'SOURCES',
    on: true,
}

let views = []

function update() {
    if (!visibility(state, view))
        return

    views.forEach(e => e.remove())
    views = []

    const sources = db.currentSources()

    sources.forEach(e => {
        const card = view_template.clone()
        views.push(card)

        view_cards.append(card)
        card.removeClass('d-none')

        if (e.title !== undefined)
            card.find('.stitle').html(e.title)
        if (e.unseen !== undefined)
            card.find('.sunseen').html(e.unseen)
        if (e.stars !== undefined)
            card.find('.sstars').html(e.stars)

        const sinfo = card.find('.sinfo')

        if (e.err)
            sinfo.addClass('serror')

        sinfo.on('click', (o) => {
            alert(JSON.stringify(e, null, 2))
            o.stopPropagation()
        })

        card.on('click', () => {
            db.filter({ source_id: e.source_id })
            ctrl.showFeeds()
        })
    })
}

module.exports = {
    update,
    me: () => state.me,
}