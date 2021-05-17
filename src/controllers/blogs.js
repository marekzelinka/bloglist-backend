const express = require('express')
const Blog = require('../models/blog')

const blogsRouter = express.Router()

blogsRouter.get('/', async (_req, res) => {
  const blogs = await Blog.find()
  res.json(blogs)
})

blogsRouter.post('/', async (req, res) => {
  const body = req.body

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  })

  const savedBlog = await blog.save()
  res.status(201).json(savedBlog)
})

module.exports = blogsRouter
