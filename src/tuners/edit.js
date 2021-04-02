// Description: Edit feed content.

import $ from 'cheerio'

export default (e, p) => {
    let data = $.load(e.content).root()

    for (const i of p.split('&&')) {
        let arr = i.trim().split(' ')

        for (let j = 1; j < arr.length; j++)
            switch (arr[0]) {
                case 'crop': data = data.find(arr[j]).first() ; break
                case  'del':        data.find(arr[j]).remove(); break
            }
    }

    e.content = data.html()
}