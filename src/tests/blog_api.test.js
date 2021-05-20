const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const Blog = require('../models/blog')
const testHelper = require('./test_helper')
const User = require('../models/user')

const api = supertest(app)

describe('with there are initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany()
    await User.deleteMany()

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(
      testHelper.initialUser.password,
      saltRounds
    )
    const user = new User({
      username: testHelper.initialUser.username,
      passwordHash,
    })
    const savedUser = await user.save()

    for (const newBlog of testHelper.initialBlogs) {
      const blog = new Blog({
        ...newBlog,
        user: savedUser._id,
      })
      const savedBlog = await blog.save()
      user.blogs = user.blogs.concat(savedBlog._id)
      await user.save()
    }
  })

  test('blogs are returned as json', async () => {
    const getRes = await api.get('/api/blogs')
    expect(getRes.statusCode).toBe(200)
    expect(getRes.get('Content-Type')).toMatch(/application\/json/)
  })

  test('unique identifier property of the blog posts is named id', async () => {
    const blogs = await testHelper.blogsInDb()
    const noteToCheck = blogs[0]
    expect(noteToCheck.id).toBeDefined()
    expect(noteToCheck._id).not.toBeDefined()
  })

  describe('addition of a new blog', () => {
    test('succeeds with valid data', async () => {
      const validBlog = {
        title: 'TDD harms architecture',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
        likes: 0,
      }

      const token = await testHelper.authToken(api)
      const postRes = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(validBlog)
      expect(postRes.statusCode).toBe(201)
      expect(postRes.get('Content-Type')).toMatch(/application\/json/)

      const blogsAtEnd = await testHelper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(testHelper.initialBlogs.length + 1)

      const authors = blogsAtEnd.map((blog) => blog.author)
      expect(authors).toContain(validBlog.author)
    })

    test('fails with statusCode 400 if title or url are missing', async () => {
      const invalidBlog = {
        author: 'Robert C. Martin',
      }

      const token = await testHelper.authToken(api)

      const postRes = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidBlog)
      expect(postRes.statusCode).toBe(400)

      const blogsAtEnd = await testHelper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(testHelper.initialBlogs.length)
    })

    test('succeeds if the likes property is missing', async () => {
      const validBlog = {
        title: 'TDD harms architecture',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
      }

      const token = await testHelper.authToken(api)

      const postRes = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(validBlog)
      expect(postRes.statusCode).toBe(201)

      const blogsAtEnd = await testHelper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(testHelper.initialBlogs.length + 1)

      const newBlog = blogsAtEnd.find(
        (blog) => blog.author === validBlog.author
      )
      expect(newBlog.likes).toBe(0)
    })
  })

  describe('deleteion of a blog', () => {
    test('succeeds with statusCode 204 if id is valid', async () => {
      const blogsAtStart = await testHelper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      const token = await testHelper.authToken(api)

      const deleteRes = await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
      expect(deleteRes.statusCode).toBe(204)

      const blogsAtEnd = await testHelper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(testHelper.initialBlogs.length - 1)

      const urls = blogsAtEnd.map((blog) => blog.url)
      expect(urls).not.toContain(blogToDelete.url)
    })
  })

  describe('update of a blog', () => {
    test('succeeds with statusCode 200 if id is valid', async () => {
      const blogsAtStart = await testHelper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      const updatedBlog = {
        title: blogToUpdate.title,
        author: blogToUpdate.author,
        url: blogToUpdate.url,
        likes: blogToUpdate.likes + 1,
      }

      const putRes = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
      expect(putRes.statusCode).toBe(200)
      expect(putRes.body.likes).toBe(blogToUpdate.likes + 1)
    })
  })

  describe('when there are initially some user saved', () => {
    describe('addition of a new user', () => {
      test('fails with statusCode 400 if data is invalid', async () => {
        const usersAtStart = await testHelper.usersInDb()

        const invalidUser = {}

        const postRes = await api.post('/api/users').send(invalidUser)
        expect(postRes.statusCode).toBe(400)

        const usersAtEnd = await testHelper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
      })
    })
  })
})

afterAll(() => mongoose.connection.close())
