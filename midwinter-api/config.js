const { randomHex } = require('./utils')

module.exports = {
    secret: randomHex()
}