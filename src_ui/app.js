const u = require('umbrellajs')
let hotkeys = require('hotkeys-js')
let ctrl = require('./js/controller')
let { feed, sources } = require('./js/views')
let { model } = require('./js/utils')

ctrl.init(feed, sources, model)

u('.rs-prev').on('click', () => ctrl.prev())
u('.rs-next').on('click', () => ctrl.next())

hotkeys('k', () => ctrl.prev())
hotkeys('j', () => ctrl.next())

hotkeys('1', () => ctrl.show(0))
hotkeys('2', () => ctrl.show(1))

hotkeys('f', () => ctrl.fetch())
hotkeys('z', () => ctrl.toggle('seen'))

u('.rs-star').on('click', () => ctrl.toggle('star'))
hotkeys('x', () => ctrl.toggle('star'))

if (window.location.hash.length == 0) {
    const baseUrl = window.location.href.split('#')[0]
    window.location.replace(baseUrl + '#' + model.hash())
}
else
    model.hash(window.location.hash)

window.onhashchange = () => {
    model.hash(window.location.hash)
    ctrl.update()
}

if (!model.feed())
    ctrl.fetch()
