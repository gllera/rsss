// Description: Delete feed content.

export default (e, p) => e.doc.querySelectorAll(p).forEach(i => i.remove())