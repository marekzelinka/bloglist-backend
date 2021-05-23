const express = require('express')
const Blog = require('../models/blog')
const User = require('../models/user')

const testingRouter = express.Router()

testingRouter.post('/', async (_req, res) => {
  await Blog.deleteMany()
  await User.deleteMany()

  res.status(204).end()
})

module.exports = testingRouter
