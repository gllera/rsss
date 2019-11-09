const u = require('umbrellajs')
const { db, visibility } = require('../utils')
const ctrl = require('../controller')

const views = []
const view = u('.rs-sources')
const html = {
    src: {
        dest: u('.rs-cards'),
        tmpl: u('.rs-card'),
    },
    tag: {
        dest: u('.rs-tags'),
        tmpl: u('.rs-tag'),
    }
}

const state = {
    me: 'SOURCES',
    on: true,
}

function addCard(e, v) {
    const card = v.tmpl.clone()
    views.push(card)

    v.dest.append(card)
    card.removeClass('d-none')

    card.find('.stitle').html(e.title)
    card.find('.sunseen').html(e.unseen)

    const star = card.find('.sstars')
    const sinfo = card.find('.sinfo')

    star.html(e.stars)

    if (e.err)
        sinfo.addClass('serror')

    if (!e.source_id && db.filter().tag == e.tag_filter)
        card.addClass('sselected')

    sinfo.on('click', (o) => {
        alert(JSON.stringify(e, null, 2))
        o.stopPropagation()
    })

    card.on('click', () => {
        const tag = db.filter().tag

        db.filter({ source_id: e.source_id, tag: e.tag_filter })

        if (e.source_id || tag == e.tag_filter)
            ctrl.showFeeds()
        else
            update()
    })
}

function update() {
    if (!visibility(state, view))
        return

    views.forEach(e => e.remove())
    views.length = 0

    const sources = db.getSources()
    const tags = db.getTags()

    tags.forEach(e => addCard(e, html.tag))
    sources.forEach(e => addCard(e, html.src))
}

module.exports = {
    update,
    me: () => state.me,
}