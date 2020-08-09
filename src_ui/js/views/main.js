const $ = require('cash-dom')

const views = []
const sources_dest = $('.rs-cards')
const sources_tmpl = $('.rs-card')
const tags_dest = $('.rs-tags')
const tags_tmpl = $('.rs-tag')

function addCard(e, selected, template, dest, cb) {
    const card = template.clone()

    views.push(card)
    dest.append(card)

    card.find('.stitle').html(e.title)
    card.find('.sunseen').html(e.unseen)

    const star = card.find('.sstars')
    const sinfo = card.find('.sinfo')

    star.html(e.stars)

    if (e.err)
        sinfo.addClass('serror')

    if (selected)
        card.addClass('sselected')

    sinfo.on('click', (o) => {
        alert(JSON.stringify(e, null, 2))
        o.stopPropagation()
    })

    card.on('click', () => cb(e))
}

function update(sources, sel_source, sel_tag, tags, cb) {
    for (const i of views) i.remove()
    views.length = 0

    for (const i of tags)
        addCard(i, i.tag == sel_tag, tags_tmpl, tags_dest, cb)

    for (const i of sources)
        addCard(i, i.source_id == sel_source, sources_tmpl, sources_dest, cb)
}

module.exports = {
    $: $('.rs-sources'),
    update,
}