let hotkeys = require('hotkeys-js')
let ctrl = require('./js/controller')

ctrl.config()

hotkeys('j', () => {
    window.scrollTo(0, 0)
    ctrl.prev()
    ctrl.setSeen()
})
hotkeys('k', () => {
    window.scrollTo(0, 0)
    ctrl.next()
    ctrl.setSeen()
})
hotkeys('1', () => {
    window.scrollTo(0, 0)
    ctrl.showPanel()
    ctrl.setSeen()
})
hotkeys('2', () => {
    window.scrollTo(0, 0)
    ctrl.showFeeds()
})
hotkeys('f', () => ctrl.fetch())

hotkeys('z', () => ctrl.setSeen())
hotkeys('x', () => ctrl.setStar())
