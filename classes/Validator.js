const Validator = {
    validateEmail(email) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return true
        else return false
    },

    checkIfNotEmpty(...items) {
        let isNotEmpty = true
        items.forEach(item => {
            if (item.length === 0) {
                isNotEmpty = false
            }
        })
        return isNotEmpty
    }
}

module.exports = Validator