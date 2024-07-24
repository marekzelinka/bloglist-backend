import express from 'express'
import { Blog } from '../models/blog.js'

export const blogsRouter = express.Router()

blogsRouter.get('/', (_req, res) => {
  Blog.find({}).then((blogs) => {
    res.json(blogs)
  })
})

blogsRouter.post('/', (req, res) => {
  const blog = new Blog(req.body)

  blog.save().then((result) => {
    res.status(201).json(result)
  })
})
