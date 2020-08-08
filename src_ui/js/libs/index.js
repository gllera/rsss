function visibility(state, view) {
    const on = model.view() == state.me

    if (on != state.on) {
        if (on)
            view.removeAttr('style')
        else
            view.attr('style', 'display: none')
    }

    return state.on = on
}

module.exports = {
    db: require('./db'),
    hash: require('./hash'),
    importer: require('./importer'),
    visibility,
}