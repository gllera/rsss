const model = require('./model')

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
    model,
    visibility
}