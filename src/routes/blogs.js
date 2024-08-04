import express from 'express'
import { Blog } from '../models/blog.js'
import { userExtractor } from '../utils/middleware.js'

export const blogsRouter = express.Router()

blogsRouter.post('/', userExtractor, async (req, res) => {
  const blog = new Blog({ ...req.body, user: req.user.id })
  const savedBlog = await blog.save()

  req.user.blogs = req.user.blogs.concat(savedBlog._id)
  await req.user.save()

  res.status(201).json(savedBlog)
})

blogsRouter.get('/', async (_req, res) => {
  const blogs = await Blog.find({}).populate('user', { username: 1 })
  res.json(blogs)
})

blogsRouter.put('/:id', async (req, res) => {
  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  })
  res.json(updatedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (req, res) => {
  const blog = await Blog.findById(req.params.id)
  if (blog.user.toString() !== req.user.id.toString()) {
    return res.status(401).json({
      error: 'nice try xD',
    })
  }

  await blog.deleteOne()

  res.status(204).end()
})
