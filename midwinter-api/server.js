const SQL = require('sql-template-strings')
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const exjwt = require('express-jwt')

const { makeQuery } = require('./db')
const { hash } = require('./utils')
const { secret } = require('./config')

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
                    jwt: jwt.sign({ id }, secret, { expiresIn: 60 * 60 }),
                }
            })
        } else {
            res.status(401).json({ success: false, message: 'Wrong username or password!' })
        }
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
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
                    jwt: jwt.sign({ id }, secret, { expiresIn: 60 * 60 }),
                }
            })
        }
    } catch (err) {
        console.error(err)
        res.status(401).json({ success: false, message: err })
    }

})

// Error handling 
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ success: false, message: err })
    }
    else {
        next(err)
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
        res.sendStatus(500)
    }
})

// All remaining requests return the React app, so it can handle routing.
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../midwinter-app/build', 'index.html'))
})

// example SQL
// SELECT m.id, u.username, m.message, m.created_on FROM Messages as m LEFT JOIN Users as u ON m.user_id = u.id

module.exports = { app }