const u = require('umbrellajs')
const { model, visibility } = require('../utils')
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

    card.find('.stitle').html(e.title)
    card.find('.sunseen').html(e.unseen)

    const star = card.find('.sstars')
    const sinfo = card.find('.sinfo')

    star.html(e.stars)

    if (e.err)
        sinfo.addClass('serror')

    if (!e.source_id && model.filter().tag == e.tag_filter)
        card.addClass('sselected')

    sinfo.on('click', (o) => {
        alert(JSON.stringify(e, null, 2))
        o.stopPropagation()
    })

    card.on('click', () => {
        const tag = model.filter().tag

        model.filter({
            source_id: e.source_id,
            tag: e.hasOwnProperty('tag_filter') ? e.tag_filter : tag
        })

        if (e.source_id || tag == e.tag_filter)
            ctrl.show('FEED')
        else
            ctrl.update()
    })
}

function update() {
    if (!visibility(state, view))
        return

    views.forEach(e => e.remove())
    views.length = 0

    const sources = model.sources()
    const tags = model.tags()

    tags.forEach(e => addCard(e, html.tag))
    sources.forEach(e => addCard(e, html.src))
}

module.exports = {
    update,
    me: () => state.me,
}