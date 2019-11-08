let hotkeys = require('hotkeys-js')
let ctrl = require('./js/controller')
let { feed, sources } = require('./js/views')
let { db } = require('./js/utils')

ctrl.init(feed, sources, db)

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
    ctrl.showSources()
})
hotkeys('2', () => {
    window.scrollTo(0, 0)
    ctrl.showFeeds()
})

hotkeys('f', () => ctrl.fetch())
hotkeys('z', () => ctrl.toggleVal('seen'))
hotkeys('x', () => ctrl.toggleVal('star'))
