// Description: Add enclosures to feed.

import { URL } from 'url'
import { basename } from 'path'

export default e => {
    let ul = undefined

    for (const i of e.enclosures)
        if (i.type.startsWith('image/')) {
            const p = e.doc.createElement('p')
            const img = e.doc.createElement('img')

            img.src = i.url
            p.append(img)
            e.doc.body.prepend(p)
        } else {
            if (!ul) {
                const h3 = e.doc.createElement('h3')
                h3.innerHTML = 'Attachments:'
                e.doc.body.append(h3)
                e.doc.body.append(ul = e.doc.createElement('ul'))
            }

            const li = e.doc.createElement('li')
            const a = e.doc.createElement('a')

            a.href = i.url
            a.innerHTML = basename(new URL(i.url).pathname)
            li.append(a)
            ul.append(li)
        }
}