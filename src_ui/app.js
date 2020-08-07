const $ = require('cash-dom')
let hotkeys = require('hotkeys-js')
let ctrl = require('./js/controller')
let { feed, sources, importer } = require('./js/views')
let { model } = require('./js/libs')

ctrl.init(feed, sources, model)
const hash = () => window.location.hash.substring(1)

$('.rs-prev').on('click', () => ctrl.prev())
$('.rs-next').on('click', () => ctrl.next())

hotkeys('k', () => ctrl.prev())
hotkeys('j', () => ctrl.next())

hotkeys('1', () => ctrl.show(0))
hotkeys('2', () => ctrl.show(1))

hotkeys('f', () => ctrl.fetch())
hotkeys('z', () => ctrl.toggle('seen'))

$('.rs-star').on('click', () => ctrl.toggle('star'))
hotkeys('x', () => ctrl.toggle('star'))

hotkeys('i', () => importer())

if (window.location.hash.length == 0) {
    const baseUrl = window.location.href.split('#')[0]
    window.location.replace(baseUrl + '#' + model.hash())
} else
    ctrl.update(hash())

window.onhashchange = () => ctrl.update(hash())

if (!model.sources().length)
    ctrl.fetch(0)
        .then(e => ctrl.fetch(1))
