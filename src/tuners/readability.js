// Description: Makes feeds more readable.

import { Readability } from '@mozilla/readability'

export default e => e.doc.body.innerHTML = new Readability(e.doc).parse().content