import assert from 'node:assert'
import { test } from 'node:test'
import { dummy } from '../utils/list-helper.js'

test('dummy returns one', () => {
  const blogs = []

  const result = dummy(blogs)
  assert.strictEqual(result, 1)
})
