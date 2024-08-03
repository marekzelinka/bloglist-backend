import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import assert from 'node:assert'
import { after, beforeEach, describe, test } from 'node:test'
import supertest from 'supertest'
import { app } from '../src/app.js'
import { Blog } from '../src/models/blog.js'
import { User } from '../src/models/user.js'
import { blogsInDb, initialBlogs, usersInDb } from './blog-test-utils.js'

const api = supertest(app)

describe('when inittialy there are some blogs', () => {
  const initialUserCredentials = { username: 'root', password: 'sekret' }

  beforeEach(async () => {
    await User.deleteMany()
    const passwordHash = await bcrypt.hash(initialUserCredentials.password, 10)
    const user = new User({
      username: initialUserCredentials.username,
      passwordHash,
    })
    await user.save()

    await Blog.deleteMany()
    for (const blog of initialBlogs) {
      await new Blog({ ...blog, user: user.id }).save()
    }
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

  describe('addition of a new blog', () => {
    describe('suceeds with status code of 201 when', () => {
      test('data is valid', async () => {
        const loginRes = await api
          .post('/api/login')
          .send(initialUserCredentials)
        const token = loginRes.body.token

        const validBlogObject = {
          title: 'First class tests',
          author: 'Robert C. Martin',
          url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
          likes: 10,
        }

        const res = await api
          .post('/api/blogs')
          .send(validBlogObject)
          .set('Authorization', `Bearer ${token}`)
        assert.strictEqual(res.status, 201)
        assert.match(res.get('Content-Type'), /application\/json/)
        // On acciedent I've called `await api.post('/api/blogs', obj)
        // This check is just here so I remember the correct API
        assert.strictEqual(res.body.title, validBlogObject.title)

        const blogsAfter = await blogsInDb()
        assert.strictEqual(blogsAfter.length, initialBlogs.length + 1)
        const titles = blogsAfter.map((blog) => blog.title)
        assert(titles.includes(validBlogObject.title))
      })

      test('data is still valid, but the likes property is missing, it will default to 0', async () => {
        const loginRes = await api
          .post('/api/login')
          .send(initialUserCredentials)
        const token = loginRes.body.token

        const validBlogObject = {
          title: 'First class tests',
          author: 'Robert C. Martin',
          url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
        }

        const res = await api
          .post('/api/blogs')
          .send(validBlogObject)
          .set('Authorization', `Bearer ${token}`)
        assert.strictEqual(res.status, 201)
        assert.match(res.get('Content-Type'), /application\/json/)
        assert.strictEqual(res.body.likes, 0)

        const blogsAfter = await blogsInDb()
        assert.strictEqual(blogsAfter.length, initialBlogs.length + 1)
        const everyBlogHasLikes = blogsAfter.every(
          (blog) => typeof blog.likes === 'number',
        )
        assert(everyBlogHasLikes)
      })
    })

    test('fails with status code of 400 if title or url is missing', async () => {
      const loginRes = await api.post('/api/login').send(initialUserCredentials)
      const token = loginRes.body.token

      const invvalidBlogObject = {
        author: 'Robert C. Martin',
        lieks: 10,
      }

      const res = await api
        .post('/api/blogs')
        .send(invvalidBlogObject)
        .set('Authorization', `Bearer ${token}`)
      assert.strictEqual(res.status, 400)

      const blogsAfter = await blogsInDb()
      assert.strictEqual(blogsAfter.length, initialBlogs.length)
    })
  })

  describe('deletion of a blog', () => {
    test('suceeds with status code of 204 if id is valid', async () => {
      const loginRes = await api.post('/api/login').send(initialUserCredentials)
      const token = loginRes.body.token

      const blogsBefore = await Blog.find()
      const blogToDelete = blogsBefore[0]

      const res = await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
      assert.strictEqual(res.status, 204)

      const blogsAfter = await blogsInDb()
      assert.strictEqual(blogsAfter.length, initialBlogs.length - 1)
      const titles = blogsAfter.map((blog) => blog.title)
      assert(!titles.includes(blogToDelete.title))
    })
  })

  describe('updating a blog', () => {
    test('suceeds with status code of 200 if id is valid', async () => {
      const blogsBefore = await Blog.find()
      const blogToUpdate = blogsBefore[0]
      const blogUpdates = { likes: blogToUpdate.likes + 1 }

      const res = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(blogUpdates)
      assert.strictEqual(res.status, 200)
      assert.match(res.get('Content-Type'), /application\/json/)
      assert.strictEqual(res.body.likes, blogUpdates.likes)
    })
  })

  describe('when there is initially one user in db', () => {
    beforeEach(async () => {
      await User.deleteMany()

      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })

      await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
      const usersBefore = await usersInDb()

      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }

      const res = await api.post('/api/users').send(newUser)
      assert.strictEqual(res.status, 201)
      assert.match(res.get('Content-Type'), /application\/json/)

      const usersAfter = await usersInDb()
      assert.strictEqual(usersAfter.length, usersBefore.length + 1)
      const usernames = usersAfter.map((u) => u.username)
      assert(usernames.includes(newUser.username))
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersBefore = await usersInDb()

      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen',
      }

      const res = await api.post('/api/users').send(newUser)
      assert.strictEqual(res.status, 400)
      assert.match(res.get('Content-Type'), /application\/json/)
      assert(res.body.error.includes('expected `username` to be unique'))

      const usersAfter = await usersInDb()
      assert.strictEqual(usersAfter.length, usersBefore.length)
    })

    test('creation fails with proper statuscode and message if password is too short', async () => {
      const usersBefore = await usersInDb()

      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 's1',
      }

      const res = await api.post('/api/users').send(newUser)
      assert.strictEqual(res.status, 400)
      assert.match(res.get('Content-Type'), /application\/json/)
      assert(res.body.error.includes('password is too shorty'))

      const usersAfter = await usersInDb()
      assert.strictEqual(usersAfter.length, usersBefore.length)
    })
  })

  after(async () => {
    await mongoose.connection.close()
  })
})
