import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import invariant from 'tiny-invariant'

const PORT = process.env.PORT
invariant(PORT, "Missing PORT env var")
const MONGODB_URI = process.env.MONGODB_URI
invariant(MONGODB_URI, "Missing MONGODB_URI env var")

const app = express()

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

const Blog = mongoose.model('Blog', blogSchema)

mongoose.connect(MONGODB_URI)

app.use(cors())
app.use(express.json())

app.get('/api/blogs', (_request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})