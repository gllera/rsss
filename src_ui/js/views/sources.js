const u = require('umbrellajs')
const { db, visibility } = require('../utils')
const ctrl = require('../controller')

const view = u('.rs-sources')
const view_cards = u('.rs-cards')
const view_template = u('.rs-card')

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
        db.filter({ source_id: e.source_id, tag: e.tag_filter })
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

    const tags = {}

    sources.forEach(e => {
        if (e.tag && !tags[e.tag])
            tags[e.tag] = {
                title: e.tag,
                count: 0,
                unseen: 0,
                stars: 0,
                tag_filter: e.tag,
            }

        k.forEach(i => {
            all[i] += e[i]

            if (e.tag)
                tags[e.tag][i] += e[i]
        })
    })

    addCard(all)
    Object.keys(tags).forEach(e => addCard(tags[e]))
    sources.forEach(e => addCard(e))
}

module.exports = {
    update,
    me: () => state.me,
}