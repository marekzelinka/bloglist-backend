import mongoose from 'mongoose'
import assert from 'node:assert'
import { after, beforeEach, describe, test } from 'node:test'
import supertest from 'supertest'
import { app } from '../src/app.js'
import { Blog } from '../src/models/blog.js'
import { getSavedBlogs, initialBlogs } from './blog-test-utils.js'

const api = supertest(app)

describe('when inittialy there are some blogs', () => {
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

  describe('addition of a new blog', () => {
    describe('suceeds with status code of 201 when', () => {
      test('data is valid', async () => {
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

        const blogsAfter = await getSavedBlogs()
        assert.strictEqual(blogsAfter.length, initialBlogs.length + 1)
        const titles = blogsAfter.map((blog) => blog.title)
        assert(titles.includes(validBlogObject.title))
      })

      test('data is still valid, but the likes property is missing, it will default to 0', async () => {
        const validBlogObject = {
          title: 'First class tests',
          author: 'Robert C. Martin',
          url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
        }

        const res = await api.post('/api/blogs').send(validBlogObject)
        assert.strictEqual(res.status, 201)
        assert.match(res.get('Content-Type'), /application\/json/)
        assert.strictEqual(res.body.likes, 0)

        const blogsAfter = await getSavedBlogs()
        assert.strictEqual(blogsAfter.length, initialBlogs.length + 1)
        const everyBlogHasLikes = blogsAfter.every(
          (blog) => typeof blog.likes === 'number',
        )
        assert(everyBlogHasLikes)
      })
    })

    test('fails with status code of 400 if title or url is missing', async () => {
      const invvalidBlogObject = {
        author: 'Robert C. Martin',
        lieks: 10,
      }

      const res = await api.post('/api/blogs').send(invvalidBlogObject)
      assert.strictEqual(res.status, 400)

      const blogsAfter = await getSavedBlogs()
      assert.strictEqual(blogsAfter.length, initialBlogs.length)
    })
  })
  describe('deletion of a blog', () => {
    test('suceeds with status code of 204 if id is valid', async () => {
      const blogsBefore = await Blog.find()
      const blogToDelete = blogsBefore[0]

      const res = await api.delete(`/api/blogs/${blogToDelete.id}`)
      assert.strictEqual(res.status, 204)

      const blogsAfter = await getSavedBlogs()
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

  after(async () => {
    await mongoose.connection.close()
  })
})
