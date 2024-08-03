import bcrypt from 'bcrypt'
import express from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.js'
import { env } from '../utils/env.js'

export const loginRouter = express.Router()

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username })
  const passwordCorrect = !user?.passwordHash
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!passwordCorrect) {
    return res.status(400).json({
      error: 'invalid username or password',
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }
  const token = jwt.sign(userForToken, env.SECRET)

  res.status(200).json({
    token,
    username: user.username,
    name: user.name,
  })
})
