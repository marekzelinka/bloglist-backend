import mongoose from 'mongoose'
import assert from 'node:assert'
import { after, test } from 'node:test'
import supertest from 'supertest'
import { app } from '../src/app.js'

const api = supertest(app)

test('returns the correct amount of blog posts in the JSON format', async () => {
  const res = await api.get('/api/blogs')
  assert.strictEqual(res.status, 200)
  assert.match(res.get('Content-Type'), /application\/json/)
})

after(async () => {
  await mongoose.connection.close()
})
