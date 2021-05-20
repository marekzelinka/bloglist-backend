const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const usersRouter = express.Router()

usersRouter.post('/', async (req, res) => {
  const body = req.body

  if (body.password === undefined) {
    res.status(400).json({ error: 'password must be given' })
    return
  } else if (body.password.trim().length < 3) {
    res
      .status(400)
      .json({ error: 'password must be at least 3 characters long' })
    return
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  const savedUser = await user.save()
  res.status(201).json(savedUser)
})

usersRouter.get('/', async (_req, res) => {
  const users = await User.find().populate('blogs', {
    url: 1,
    title: 1,
    author: 1,
  })
  res.json(users)
})

module.exports = usersRouter
