const $ = require('cash-dom')
let hotkeys = require('hotkeys-js')
let ctrl = require('./js/controller')

$('.rs-prev').on('click', () => ctrl.prev())
$('.rs-next').on('click', () => ctrl.next())
$('.rs-star').on('click', () => ctrl.toggle_star())

hotkeys('k', () => ctrl.prev())
hotkeys('j', () => ctrl.next())
hotkeys('f', () => ctrl.sync())
hotkeys('i', () => ctrl.import())
hotkeys('z', () => ctrl.toggle_seen())
hotkeys('x', () => ctrl.toggle_star())
hotkeys('1', () => ctrl.show({ view: 'main'}))
hotkeys('2', () => ctrl.show({ view: 'feed'}))

ctrl.show()
ctrl.sync()