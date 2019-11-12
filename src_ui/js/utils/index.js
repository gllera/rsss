const model = require('./model')

function visibility(state, view) {
    const on = model.view() == state.me

    if (on != state.on) {
        if (on)
            view.removeClass('d-none')
        else
            view.addClass('d-none')
    }

    return state.on = on
}

module.exports = {
    model,
    visibility
}