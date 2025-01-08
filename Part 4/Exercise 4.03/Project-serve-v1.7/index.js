const app = require('./app') // The Express app
const config = require('./utils/config')
const logger = require('./utils/logger')

app.get('/', (req, res) => {
  res.status(200)
})

// app.get('/healthz', (req, res) => {
//   res.status(200)
// })

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})