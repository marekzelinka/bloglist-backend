const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('express-async-errors')
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const app = express()

const uri =
  process.env.NODE_ENV !== 'test' ? config.MONGODB_URI : config.TEST_MONGODB_URI

console.log('connecting to database', uri)
mongoose
  .connect(uri, {
    useCreateIndex: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('connected to database'))
  .catch((error) =>
    console.error('error connecting to database:', error.message)
  )

app.use(cors())
app.use(express.json())
app.use(middleware.tokenExtractor)
app.use(middleware.reqLogger)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.unknowEndpoint)
app.use(middleware.errorHandler)

module.exports = app
