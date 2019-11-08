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

function addCard(e) {
    const card = view_template.clone()
    views.push(card)

    view_cards.append(card)
    card.removeClass('d-none')

    card.find('.stitle').html(e.title)
    card.find('.sunseen').html(e.unseen)

    const star = card.find('.sstars')
    const sinfo = card.find('.sinfo')

    star.html(e.stars)

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
}

function update() {
    if (!visibility(state, view))
        return

    views.forEach(e => e.remove())
    views = []

    const k = ['count', 'unseen', 'stars']
    const sources = db.getSources()
    const all = {
        title: 'ALL',
        count: 0,
        unseen: 0,
        stars: 0,
    }

    k.forEach(i =>
        sources.forEach(e => {
            if (e[i])
                all[i] += e[i]
        })
    )

    addCard(all)
    sources.forEach(e => addCard(e))
}

module.exports = {
    update,
    me: () => state.me,
}