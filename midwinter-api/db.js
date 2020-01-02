const { Pool } = require('pg')

var pool

const getPool = () => {
    if (pool) return pool
    return new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    })
}

const makeQuery = async query => {
    try {
        // needs to be hoisted for some reason
        var client = await getPool().connect()
        const result = await client.query(query)
        return result
    } finally {
        if (client) client.release()
    }
}

module.exports = { getPool, makeQuery }