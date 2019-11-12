let hotkeys = require('hotkeys-js')
let ctrl = require('./js/controller')
let { feed, sources } = require('./js/views')
let { model } = require('./js/utils')

ctrl.init(feed, sources, model)

hotkeys('k', () => {
    window.scrollTo(0, 0)
    ctrl.prev()
})
hotkeys('j', () => {
    window.scrollTo(0, 0)
    ctrl.next()
})

hotkeys('1', () => {
    window.scrollTo(0, 0)
    ctrl.show('SOURCES')
})
hotkeys('2', () => {
    window.scrollTo(0, 0)
    ctrl.showFeeds('FEED')
})

hotkeys('f', () => ctrl.fetch())
hotkeys('z', () => ctrl.toggle('seen'))
hotkeys('x', () => ctrl.toggle('star'))
