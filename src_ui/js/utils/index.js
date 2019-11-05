const db = require('./db')

function visibility(state, view) {
    const on = db.getView() == state.me

    if (on != state.on) {
        if (on)
            view.removeClass('d-none')
        else
            view.addClass('d-none')
    }

    return state.on = on
}

module.exports = {
    db,
    visibility
}