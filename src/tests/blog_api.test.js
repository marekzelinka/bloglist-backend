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
  expect(noteToView.id).toBeDefined()
  expect(noteToView._id).not.toBeDefined()
})

test('a valid blog can be added', async () => {
  const validBlog = {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
  }

  const postRes = await api.post('/api/blogs').send(validBlog)
  expect(postRes.statusCode).toBe(201)
  expect(postRes.get('Content-Type')).toMatch(/application\/json/)

  const blogsAtEnd = await testHelper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(testHelper.initialBlogs.length + 1)

  const authors = blogsAtEnd.map((blog) => blog.author)
  expect(authors).toContain(validBlog.author)
})

test('if the likes property is missing, default to 0', async () => {
  const validBlog = {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
  }

  const postRes = await api.post('/api/blogs').send(validBlog)
  expect(postRes.statusCode).toBe(201)

  const blogsAtEnd = await testHelper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(testHelper.initialBlogs.length + 1)

  const newBlog = blogsAtEnd.find((blog) => blog.author === validBlog.author)
  expect(newBlog.likes).toBe(0)
})

test('blog without title and url is not added', async () => {
  const invalidBlog = {
    author: 'Robert C. Martin',
  }

  const postRes = await api.post('/api/blogs').send(invalidBlog)
  expect(postRes.statusCode).toBe(400)

  const blogsAtEnd = await testHelper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(testHelper.initialBlogs.length)
})

test('deletion succeeds with statusCode 204 if id is valid', async () => {
  const blogsAtStart = await testHelper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  const deleteRes = await api.delete(`/api/blogs/${blogToDelete.id}`)
  expect(deleteRes.statusCode).toBe(204)

  const blogsAtEnd = await testHelper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(testHelper.initialBlogs.length - 1)

  const urls = blogsAtEnd.map((blog) => blog.url)
  expect(urls).not.toContain(blogToDelete.url)
})

afterAll(() => mongoose.connection.close())
