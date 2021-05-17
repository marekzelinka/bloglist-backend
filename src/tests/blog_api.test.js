const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const testHelper = require('./test_helper')

beforeEach(async () => {
  await Blog.deleteMany()
  await Blog.insertMany(testHelper.initialBlogs)
})

const api = supertest(app)

test('blogs are returned as json', async () => {
  const getRes = await api.get('/api/blogs')
  expect(getRes.statusCode).toBe(200)
  expect(getRes.get('Content-Type')).toMatch(/application\/json/)
})

test('unique identifier property of the blog posts is named id', async () => {
  const getRes = await api.get('/api/blogs')
  const noteToView = getRes.body[0]
  console.log(noteToView)
  expect(noteToView.id).toBeDefined()
  expect(noteToView._id).not.toBeDefined()
})

afterAll(() => mongoose.connection.close())
