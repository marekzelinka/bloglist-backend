import bcrypt from 'bcrypt'
import express from 'express'
import { User } from '../models/user.js'

export const usersRouter = express.Router()

usersRouter.post('/', async (req, res) => {
  const { username, name, password } = req.body

  if (password?.length < 3) {
    return res.status(400).json({ error: 'password is too shorty' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })
  const savedUser = await user.save()

  res.status(201).json(savedUser)
})

usersRouter.get('/', async (_req, res) => {
  const users = await User.find({})

  res.json(users)
})
