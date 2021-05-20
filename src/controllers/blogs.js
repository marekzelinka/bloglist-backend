const express = require('express')
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')

const blogsRouter = express.Router()

blogsRouter.post('/', middleware.userExtractor, async (req, res) => {
  const body = req.body
  const user = await User.findById(req.user._id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user.id,
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  res.status(201).json(savedBlog)
})

blogsRouter.get('/', async (_req, res) => {
  const blogs = await Blog.find().populate('user', { username: 1, name: 1 })
  res.json(blogs)
})

blogsRouter.put('/:id', async (req, res) => {
  const body = req.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, {
    new: true,
    runValidators: true,
  })
  res.json(updatedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (req, res) => {
  const blog = await Blog.findById(req.params.id)
  if (blog === null) {
    res.status(204).end()
    return
  }

  if (blog.user.toString() !== req.user._id.toString()) {
    res.status(401).json({ error: 'invalid owner' })
    return
  }

  await blog.delete()
  res.status(204).end()
})

module.exports = blogsRouter
