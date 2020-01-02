const { app } = require('./server')

const port = process.env.NODE_ENV === 'production' ? 80 : 5000

app.listen(port, () => console.log(`Midwinter API has launched 🚀 (port: ${port})`))