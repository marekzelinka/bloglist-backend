import mongoose from 'mongoose'
import assert from 'node:assert'
import { after, beforeEach, test } from 'node:test'
import supertest from 'supertest'
import { app } from '../src/app.js'
import { Blog } from '../src/models/blog.js'

const api = supertest(app)

const initialBlogs = [
  {
    id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    id: '5a422aa71b54a676234d17f8',
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

after(async () => {
  await mongoose.connection.close()
})
