// Description: Delete feed content.

export default (e, p) => {
    for (const i of p.split('|'))
        e.doc.querySelectorAll(i).forEach(j => j.remove())
}