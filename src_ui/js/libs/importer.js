const $ = require('cash-dom')

const file = $('[type=file]')

file.on('change', e => {
    if (e.target.files.length) {
        const form = new FormData()
        form.append('file', e.target.files[0])

        const req = new XMLHttpRequest()

        req.onreadystatechange = () => {
            if (req.readyState == XMLHttpRequest.DONE) {
                if (req.status != 200)
                    return alert(`Error, response code: ${req.status}`)

                const res = JSON.parse(req.responseText)
                alert(`Sources imported: ${res.length}`)
            }
        }

        req.open('POST', config.RSSS_URL + '/import')
        req.send(form)

        e.target.value = ''
    }
})

module.exports = () => file.trigger('click')