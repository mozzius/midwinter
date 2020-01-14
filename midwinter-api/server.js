const SQL = require('sql-template-strings')
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const exjwt = require('express-jwt')
const http = require('http')
const socketIo = require('socket.io')

const { makeQuery } = require('./db')
const { hash } = require('./utils')
const { secret } = require('./config')

// jwt expiry
const EXPIRY = 86400

const app = express()

server = http.Server(app)

io = socketIo(server)

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

app.post('/login', async (req, res) => {
    //if (!req.accepts('application/json')) res.status(406).send({ message: '406 Not Acceptable' })

    try {
        const { username, password } = req.body
        const { rowCount, rows } = await makeQuery(SQL`SELECT * FROM users WHERE username=${username} AND password=${hash(password)} LIMIT 1`)

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

        const exists = await makeQuery(SQL`SELECT EXISTS (SELECT 1 FROM users WHERE username=${username} OR email=${email})`)

        if (exists.rows[0].exists) {
            res.status(200).json({ success: false, message: 'Username or email already taken' })
        } else {
            const val = await makeQuery(SQL`INSERT INTO users (username, email, password) VALUES (${username}, ${email}, ${hash(password)}) RETURNING id`)
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

app.get('/api/servers/get', jwtMW, async (req, res) => {
    try {
        // we know JWT is valid so just dive in
        const { id: user } = jwt.decode(req.headers.authorization.split(' ')[1])

        const { rows } = await makeQuery(SQL`SELECT s.id, s.name, s.code FROM servers AS s INNER JOIN server_members as m ON s.id = m.server_id WHERE m.user_id = ${user}`)
        res.status(200).json({
            success: true,
            servers: rows
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: err })
    }
})

app.post('/api/servers/join', jwtMW, async (req, res) => {
    try {
        const { id: user } = jwt.decode(req.headers.authorization.split(' ')[1])

        const { server } = req.body

        const { rowCount, rows } = await makeQuery(SQL`SELECT id, name, code, invite_only FROM servers WHERE code = ${server}`)
        if (rowCount > 0 && rows[0].invite_only === false) {
            await makeQuery(SQL`INSERT INTO server_members (server_id, user_id) VALUES (${rows[0].id}, ${user})`)
            res.status(200).json({ success: true, server: rows[0] })
        } else {
            res.status(200).json({ success: false })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: err })
    }
})

app.post('/api/search', jwtMW, async (req, res) => {
    try {
        const { id: user } = jwt.decode(req.headers.authorization.split(' ')[1])
        const { search, server } = req.body

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
            INNER JOIN channel_members as m
            ON c.id = m.channel_id
            INNER JOIN users AS u ON u.id = m.user_id
            WHERE c.server_id = ${server}
            GROUP BY c.id)
        AS sub
        WHERE users @> ${`[{"username":"${search}"}]`} AND users @> ${`[{"id":"${user}"}]`}
        `)

        res.status(200).json({
            success: true,
            results: rows
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: err })
    }
})

app.post('/api/channels/get', jwtMW, async (req, res) => {
    try {
        const { id: user } = jwt.decode(req.headers.authorization.split(' ')[1])

        const { server } = req.body

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
            FROM channels AS c
            INNER JOIN channel_members AS m
            ON c.id = m.channel_id
            INNER JOIN users AS u
            ON u.id = m.user_id
            WHERE c.server_id = ${server}
            GROUP BY c.id)
        AS sub
        WHERE users @> ${`[{"id":"${user}"}]`}
        `)

        res.status(200).json({
            success: true,
            results: rows
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: err })
    }
})

app.post('/api/channels/join', jwtMW, async (req, res) => {
    try {
        const { id: user } = jwt.decode(req.headers.authorization.split(' ')[1])

        const { server, others } = req.body

        if (others.length === 0) {
            throw new Error('No participants')
        } else if (others.length === 1) {
            const { rows, rowCount } = await makeQuery(SQL`
            SELECT * FROM (
                SELECT 
                    c.id AS id,
                    c.title AS title,
                    c.private AS private,
                    c.read_only AS read_only,
                    c.created_by AS created_by,
                    c.created_on AS created_on,
                    JSONB_AGG(JSONB_BUILD_OBJECT('id', u.id, 'username', u.username)) AS users
                FROM channels AS c
                INNER JOIN channel_members AS m
                ON c.id = m.channel_id
                INNER JOIN users AS u
                ON u.id = m.user_id
                WHERE c.server_id = ${server}
                GROUP BY c.id)
            AS sub
            WHERE users @> ${`[{"id":"${user}"}]`}
            AND users @> ${`[{"id":"${others[0]}"}]`}
            AND JSONB_ARRAY_LENGTH(users) = 2
            `)

            if (rowCount > 0) {
                res.status(200).json({
                    success: true,
                    result: rows[0]
                })
            } else {
                const { rows: channelRows } = await makeQuery(SQL`INSERT INTO channels (server_id, created_by) VALUES (${server},${user}) RETURNING *`)
                const channel = channelRows[0]
                await makeQuery(SQL`INSERT INTO channel_members (user_id, channel_id) VALUES (${user}, ${channel.id})`)
                await makeQuery(SQL`INSERT INTO channel_members (user_id, channel_id) VALUES (${others[0]}, ${channel.id})`)
                const { rows: users } = await makeQuery(SQL`
                SELECT u.id AS id, u.username AS id
                FROM channel_members AS m
                INNER JOIN users AS u
                ON m.user_id = u.id
                WHERE m.channel_id = ${channel.id}
                `)

                res.status(200).json({
                    success: true,
                    channel: {
                        ...channel,
                        users
                    }
                })
            }
        } else {
            const { rows: channelRows } = await makeQuery(SQL`INSERT INTO channels (server_id, created_by) VALUES (${server},${user}) RETURNING *`)
            const channel = channelRows[0]
            await makeQuery(SQL`INSERT INTO channel_members (user_id, channel_id) VALUES (${user}, ${channel.id})`)
            for (const other of others) {
                await makeQuery(SQL`INSERT INTO channel_members (user_id, channel_id) VALUES (${other}, ${channel.id})`)
            }
            const { rows: users } = await makeQuery(SQL`
            SELECT u.id AS id, u.username AS id
            FROM channel_members AS m
            INNER JOIN users AS u
            ON m.user_id = u.id
            WHERE m.channel_id = ${channel.id}
            `)

            res.status(200).json({
                success: true,
                channel: {
                    ...channel,
                    users
                }
            })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: err })
    }
})

app.post('/api/messages/get', jwtMW, async (req, res) => {
    try {
        //const { id: user } = jwt.decode(req.headers.authorization.split(' ')[1])

        const { channel, offset } = req.body

        const { rows } = await makeQuery(SQL`
        SELECT * FROM (
            SELECT * FROM messages
            WHERE channel_id = ${channel}
            ORDER BY created_on DESC
            LIMIT 20
            OFFSET ${offset})
        AS sub
        ORDER BY sub.created_on ASC        
        `)

        res.status(200).json({
            success: true,
            messages: rows
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: err })
    }
})

app.post('/api/servers/create', jwtMW, async (req, res) => {
    try {
        const { id: user } = jwt.decode(req.headers.authorization.split(' ')[1])

        const { name, code, invite_only } = req.body.server

        if (name !== '' && code !== '') {
            const { rows } = await makeQuery(SQL`INSERT INTO servers (name, code, created_by, invite_only) VALUES (${name}, ${code}, ${user}, ${invite_only}) RETURNING *`)
            // add user to server
            await makeQuery(SQL`INSERT INTO server_members (server_id, user_id) VALUES (${rows[0].id}, ${user})`)

            res.status(200).json({
                success: true,
                server: rows[0]
            })
        } else {
            res.status(200).json({ success: false })
        }

    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: err })
    }
})


app.get('/api/checkJWT', jwtMW, (req, res) => {
    res.status(200).json({ success: true })
})

if (process.env.NODE_ENV === 'production') {
    // use react app
    app.use(express.static(path.resolve(__dirname, '../midwinter-app/build')))

    // All remaining requests return the React app, so it can handle routing.
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../midwinter-app/build', 'index.html'))
    })
}

// Error handling 
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ success: false, message: err.name })
    }
    else {
        next(err)
    }
})

io.on('connect', socket => {

    // join rooms
    socket.on('join-rooms', rooms => {
        rooms.forEach(room => {
            socket.join(room)
        })
    })

    socket.on('message', msg => {
        const { user_id, channel_id, message } = msg

        if (message !== '') {
            makeQuery(SQL`INSERT INTO messages (user_id, channel_id, message) VALUES (${user_id}, ${channel_id}, ${message}) RETURNING *`)
                .then(res => {
                    io.in(channel_id).emit('message', res.rows[0])
                })
        }
    })
})

module.exports = { app }