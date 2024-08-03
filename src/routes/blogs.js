import express from 'express'
import jwt from 'jsonwebtoken'
import { Blog } from '../models/blog.js'
import { User } from '../models/user.js'

export const blogsRouter = express.Router()

blogsRouter.post('/', async (req, res) => {
  const decodedToken = jwt.verify(req.token, process.env.SECRET)

  if (!decodedToken.id) {
    return res.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({ ...req.body, user: user.id })
  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  res.status(201).json(savedBlog)
})

blogsRouter.get('/', async (_req, res) => {
  const blogs = await Blog.find({}).populate('user', { username: 1 })
  res.json(blogs)
})

blogsRouter.put('/:id', async (req, res) => {
  const id = req.params.id
  const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  })
  res.json(updatedBlog)
})

blogsRouter.delete('/:id', async (req, res) => {
  const decodedToken = jwt.verify(req.token, process.env.SECRET)

  if (!decodedToken.id) {
    return res.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const blog = await Blog.findById(req.params.id)
  if (blog.user.toString() !== user.id.toString()) {
    return res.status(401).json({
      error: 'nice try xD',
    })
  }

  await blog.deleteOne()

  res.status(204).end()
})
