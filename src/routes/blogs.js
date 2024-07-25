import express from 'express'
import { Blog } from '../models/blog.js'

export const blogsRouter = express.Router()

blogsRouter.post('/', async (req, res) => {
  const blog = new Blog(req.body)
  const savedBlog = await blog.save()
  res.status(201).json(savedBlog)
})

blogsRouter.get('/', async (_req, res) => {
  const blogs = await Blog.find({})
  res.json(blogs)
})
