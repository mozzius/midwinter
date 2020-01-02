const { createHash, randomBytes } = require('crypto')

const hash = pwd => createHash('sha256').update(pwd).digest('base64')

const randomHex = () => randomBytes(32).toString('hex')

module.exports = { hash, randomHex }