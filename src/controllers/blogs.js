const express = require('express')
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const config = require('../utils/config')

const blogsRouter = express.Router()

blogsRouter.post('/', async (req, res) => {
  const body = req.body
  const token = req.token
  if (token === undefined) {
    res.status(401).json({ error: 'token missing' })
    return
  }

  const decodedToken = jwt.verify(token, config.SECRET)
  if (decodedToken.id === undefined) {
    res.status(401).json({ error: 'invalid token' })
    return
  }

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user.id,
  })

  user.blogs = user.blogs.concat(blog._id)
  await user.save()

  const savedBlog = await blog.save()
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

blogsRouter.delete('/:id', async (req, res) => {
  const token = req.token
  if (token === undefined) {
    res.status(401).json({ error: 'token missing' })
    return
  }

  const decodedToken = jwt.verify(token, config.SECRET)
  if (decodedToken.id === undefined) {
    res.status(401).json({ error: 'invalid token' })
    return
  }

  const blog = await Blog.findById(req.params.id)

  if (blog.user.toString() !== decodedToken.id) {
    res.status(401).json({ error: 'invalid owner' })
    return
  }

  await blog.delete()
  res.status(204).end()
})

module.exports = blogsRouter
