import mongoose from 'mongoose'
import assert from 'node:assert'
import { after, beforeEach, test } from 'node:test'
import supertest from 'supertest'
import { app } from '../src/app.js'
import { Blog } from '../src/models/blog.js'

const api = supertest(app)

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
]

beforeEach(async () => {
  await Blog.deleteMany()
  await Blog.insertMany(initialBlogs)
})

test('returns the correct amount of blog posts in the JSON format', async () => {
  const res = await api.get('/api/blogs')
  assert.strictEqual(res.status, 200)
  assert.match(res.get('Content-Type'), /application\/json/)
})

test('unique ID property of the blog is named id, not _id', async () => {
  const res = await api.get('/api/blogs')
  const blogToView = res.body[0]
  assert(blogToView.hasOwnProperty('id'))
  assert(!blogToView.hasOwnProperty('_id'))
})

test('a valid blog can be added', async () => {
  const validBlogObject = {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
  }

  const res = await api.post('/api/blogs').send(validBlogObject)
  assert.strictEqual(res.status, 201)
  assert.match(res.get('Content-Type'), /application\/json/)
  // On acciedent I've called `await api.post('/api/blogs', obj)
  // This check is just here so I remember the correct API
  assert.strictEqual(res.body.title, validBlogObject.title)

  const blogsAfter = await Blog.find()
  assert.strictEqual(blogsAfter.length, initialBlogs.length + 1)
  const titles = blogsAfter.map((blog) => blog.title)
  assert(titles.includes(validBlogObject.title))
})

test('if likes property is missing, it will default to 0', async () => {
  const validBlogObject = {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
  }

  const res = await api.post('/api/blogs').send(validBlogObject)
  assert.strictEqual(res.status, 201)
  assert.strictEqual(res.body.likes, 0)

  const blogsAfter = await Blog.find()
  assert.strictEqual(blogsAfter.length, initialBlogs.length + 1)
  const everyBlogHasLikes = blogsAfter.every(
    (blog) => typeof blog.likes === 'number',
  )
  assert(everyBlogHasLikes)
})

after(async () => {
  await mongoose.connection.close()
})
