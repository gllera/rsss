module.exports = {
    defaults: (opts = {}, defaults) => {
        let res = {}

        for (let i in defaults)
            if (opts.hasOwnProperty(i))
                res[i] = opts[i]
            else
                res[i] = defaults[i]

        return res
    },
}