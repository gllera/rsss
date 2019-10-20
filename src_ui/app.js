let hotkeys = require('hotkeys-js')

let feedView = require('./js/feedView')()
let panelView = require('./js/panelView')()
let graphql = require('./js/graphql')('http://localhost:3000')
let ctrl = require('./js/controller')

ctrl.config({ feedView, panelView, graphql })

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
