const $ = require('cash-dom')

const views = []
const html = {
    src: {
        dest: $('.rs-cards'),
        tmpl: $('.rs-card'),
    },
    tag: {
        dest: $('.rs-tags'),
        tmpl: $('.rs-tag'),
    }
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
            ctrl.show(1)
        else
            ctrl.update()
    })
}

function update(sources, filter) {
    views.forEach(e => e.remove())
    views.length = 0

    // sources.forEach(e => addCard(e, html.src))
    // tags.forEach(e => addCard(e, html.tag))
}

module.exports = {
    $: $('.rs-sources'),
    update,
}