const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('express-async-errors')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')

const app = express()

logger.info('connecting to database', config.MONGODB_URI)
mongoose
  .connect(config.MONGODB_URI, {
    useCreateIndex: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info('connected to database'))
  .catch((error) =>
    logger.error('error connecting to database:', error.message)
  )

app.use(cors())
app.use(express.json())
app.use(middleware.reqLogger)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use(middleware.unknowEndpoint)
app.use(middleware.errorHandler)

module.exports = app
