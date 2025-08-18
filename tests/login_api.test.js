const { test, before, after, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const config = require('../utils/config')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

// Sanity check
if (config.NODE_ENV !== 'test') return

const api = supertest(app)

before(async () => {
  let rootUser = await User.findOne({ username: 'root' })
  if (!rootUser) {
    const newUser = {
      username: 'root',
      name: 'Root User',
      password: 'sekret',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  }
})

describe('Login endpoint', () => {
  test('login succeeds with correct credentials', async () => {
    const loginDetails = {
      username: 'root',
      password: 'sekret',
    }

    const result = await api
      .post('/api/login')
      .send(loginDetails)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(result.body.token, 'Token should be returned')
    assert.strictEqual(result.body.username, 'root')
  })

  test('login fails with wrong password', async () => {
    const loginDetails = {
      username: 'root',
      password: 'wrongpassword',
    }

    const result = await api
      .post('/api/login')
      .send(loginDetails)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('invalid username or password'))
    assert(!result.body.token)
  })

  test('login fails with non-existent user', async () => {
    const loginDetails = {
      username: 'notarealuser',
      password: 'whatever',
    }

    const result = await api
      .post('/api/login')
      .send(loginDetails)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('invalid username or password'))
    assert(!result.body.token)
  })
})

after(async () => {
  await mongoose.connection.close()
})
