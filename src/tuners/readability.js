// Description: Makes feeds more readable.

import { Readability } from '@mozilla/readability'

export default e => {
    const res = new Readability(e.doc).parse()

    if (res)
        e.doc.body.innerHTML = res.content
}