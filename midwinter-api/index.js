// get environment variables
if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const { app } = require('./server')

const port = process.env.PORT || 5000

server.listen(port, () => console.log(`Midwinter API has launched 🚀 (port: ${port})`))