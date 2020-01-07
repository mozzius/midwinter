const SQL = require('sql-template-strings')
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const exjwt = require('express-jwt')

const { makeQuery } = require('./db')
const { hash } = require('./utils')
const { secret } = require('./config')

// jwt expiry
const EXPIRY = 86400

const app = express()

// See the react auth blog in which cors is required for access
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization')
    next()
})

// Setting up bodyParser to use json and set it to req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// express-jwt middleware
const jwtMW = exjwt({ secret })

// use react app
app.use(express.static(path.resolve(__dirname, '../midwinter-app/build')))

// Error handling 
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ success: false, message: err })
    }
    else {
        next(err)
    }
})


app.post('/login', async (req, res) => {
    //if (!req.accepts('application/json')) res.status(406).send({ message: '406 Not Acceptable' })

    try {
        const { username, password } = req.body
        const { rowCount, rows } = await makeQuery(SQL`SELECT * FROM Users WHERE username=${username} AND password=${hash(password)} LIMIT 1`)

        if (rowCount > 0) {
            const { id, username, email } = rows[0]
            res.status(200).json({
                success: true,
                message: {
                    id,
                    username,
                    email,
                    expiresIn: EXPIRY,
                    jwt: jwt.sign({ id }, secret, { expiresIn: EXPIRY }),
                }
            })
        } else {
            res.status(401).json({ success: false, message: 'Wrong username or password!' })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: err })
    }
})

app.post('/signup', async (req, res) => {
    if (!req.accepts('application/json')) res.sendStatus(406)

    try {
        const { username, email, password } = req.body

        const exists = await makeQuery(SQL`SELECT EXISTS (SELECT 1 FROM Users WHERE username=${username} OR email=${email})`)

        if (exists.rows[0].exists) {
            res.status(200).json({ success: false, message: 'Username or email already taken' })
        } else {
            const val = await makeQuery(SQL`INSERT INTO Users (username, email, password) VALUES (${username}, ${email}, ${hash(password)}) RETURNING id`)
            id = val.rows[0].id
            res.status(200).json({
                success: true,
                message: {
                    id,
                    username,
                    email,
                    expiresIn: EXPIRY,
                    jwt: jwt.sign({ id }, secret, { expiresIn: EXPIRY }),
                }
            })
        }
    } catch (err) {
        console.error(err)
        res.status(401).json({ success: false, message: err })
    }

})

app.post('/api/search', jwtMW, async (req, res) => {
    try {
        const { search, user } = req.body

        const { rows } = await makeQuery(SQL`
        SELECT * FROM (
            SELECT 
                c.id AS id,
                c.title AS title,
                c.private AS private,
                c.read_only AS read_only,
                c.created_by AS created_by,
                c.created_on AS created_on,
                JSONB_AGG(JSONB_BUILD_OBJECT('id', u.id, 'username', u.username)) AS users
            FROM channels as c
            INNER JOIN channel_member as m
            ON c.id = m.channel_id
            INNER JOIN users AS u ON u.id = m.user_id
            GROUP BY c.id)
        AS sub
        WHERE users @> ${`[{"username":"${search}"}]`} AND users @> ${`[{"id":"${user}"}]`}`)

        res.status(200).json({
            success: true,
            results: rows
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: err })
    }
})

app.get('/api/servers/get', jwtMW, async (req, res) => {
    try {
        // TODO: only get servers a user is a member of
        const { rows } = await makeQuery(SQL`SELECT * FROM Servers`)
        res.status(200).json({
            success: true,
            servers: rows
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: err })
    }
})


app.post('/api/channels/get', jwtMW, async (req, res) => {
    try {
        const { user } = req.body

        const { rows } = await makeQuery(SQL`
        SELECT * FROM (
            SELECT 
                c.id AS id,
                c.title AS title,
                c.private AS private,
                c.read_only AS read_only,
                c.created_by AS created_by,
                c.created_on AS created_on,
                JSONB_AGG(JSONB_BUILD_OBJECT('id', u.id, 'username', u.username)) AS users
            FROM channels as c
            INNER JOIN channel_member as m
            ON c.id = m.channel_id
            INNER JOIN users AS u ON u.id = m.user_id
            GROUP BY c.id)
        AS sub
        WHERE users @> ${`[{"id":"${user}"}]`}`)

        res.status(200).json({
            success: true,
            results: rows
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: err })
    }
})

// All remaining requests return the React app, so it can handle routing.
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../midwinter-app/build', 'index.html'))
})

module.exports = { app }