const { app } = require('./server')

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Midwinter API has launched 🚀 (port: ${port})`))