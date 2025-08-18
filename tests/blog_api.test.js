const { test, before, beforeEach, after, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const helper = require('./test_helper.js')
const listHelper = require('../utils/list_helper.js')
const config = require('../utils/config')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user.js')

// Sanity check
if (config.NODE_ENV !== 'test') return

const api = supertest(app)

let rootUser
before(async () => {
  await User.deleteMany({})
  await User.deleteOne({ username: 'otheruser' })
  rootUser = await User.findOne({ username: 'root' })
  if (!rootUser) {
    const newUser = {
      username: 'root',
      name: 'Root User',
      password: 'sekret',
    }

    rootUser = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  }
  const result = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
    .expect(200)
    .expect('Content-Type', /application\/json/)
  rootUser = result.body
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.blogs)
})

describe('Blog: Model tests', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const blogs = await helper.blogsInDb()
    assert.strictEqual(blogs.length, helper.blogs.length)
  })

  test('blog contains id property', async () => {
    const blogs = await helper.blogsInDb()
    const blog = blogs[0]
    assert(blog.id)
    assert(!blog._id)
    assert(!blog.__v)
  })

  test('a specific blog is within the returned blogs', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.deepStrictEqual(resultBlog.body, blogToView)
  })

  test('likes default to 0', async () => {
    const newBlog = {
      title: 'Test Blog',
      author: 'Test Author',
      url: 'https://testblog.com',
      likes: 0,
    }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${rootUser.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const blogs = await helper.blogsInDb()
    const addedBlog = blogs.find((blog) => blog.title === newBlog.title)
    assert.strictEqual(addedBlog.likes, 0)
  })

  test('blog require authorization token ', async () => {
    const newBlog = {
      title: 'Test Blog',
      author: 'Test Author',
      url: 'https://testblog.com',
      likes: 0,
    }

    let result = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(result.body.error, 'token missing or invalid')
  })

  test('a valid blog can be added ', async () => {
    const newBlog = {
      title: 'Test Blog',
      author: 'Test Author',
      url: 'https://testblog.com',
      likes: 0,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${rootUser.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogs = await helper.blogsInDb()
    const titles = blogs.map((r) => r.title)
    assert.strictEqual(blogs.length, helper.blogs.length + 1)
    assert(titles.includes('Test Blog'))
  })

  test('a blog cannot be added multiple times', async () => {
    const newBlog = {
      title: 'Test Blog',
      author: 'Test Author',
      url: 'https://testblog.com',
      likes: 0,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${rootUser.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('blog without title is not added', async () => {
    const newBlog = {
      author: 'Mr Googol',
      url: 'https://google.com',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${rootUser.token}`)
      .send(newBlog)
      .expect(400)

    const blogs = await helper.blogsInDb()
    assert.strictEqual(blogs.length, helper.blogs.length)
  })

  test('blog without author is not added', async () => {
    const newBlog = {
      title: 'Programmers best friend',
      url: 'https://google.com',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${rootUser.token}`)
      .send(newBlog)
      .expect(400)

    const blogs = await helper.blogsInDb()

    assert.strictEqual(blogs.length, helper.blogs.length)
  })

  test('blog without url is not added', async () => {
    const newBlog = {
      title: 'The meaning of life',
      author: 'Deep Thought',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${rootUser.token}`)
      .send(newBlog)
      .expect(400)

    const blogs = await helper.blogsInDb()

    assert.strictEqual(blogs.length, helper.blogs.length)
  })

  test('blog delete fails without authorization', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const newBlog = {
      title: 'Test Blog',
      author: 'Test Author',
      url: 'https://testblog.com',
      likes: 0,
    }
    const postResponse = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${rootUser.token}`)
      .send(newBlog)
      .expect(201)

    const blogsAfterAdd = await helper.blogsInDb()
    assert.strictEqual(blogsAfterAdd.length, blogsAtStart.length + 1)

    let response = await api
      .delete(`/api/blogs/${postResponse.body.id}`)
      .expect(401)

    const blogsAfterDelete = await helper.blogsInDb()
    assert.strictEqual(blogsAfterAdd.length, blogsAfterDelete.length)
    assert(response.body.error.includes('token missing or invalid'))
  })

  test('blog delete works with authorization', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const newBlog = {
      title: 'Test Blog',
      author: 'Test Author',
      url: 'https://testblog.com',
      likes: 0,
    }
    const postResponse = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${rootUser.token}`)
      .send(newBlog)
      .expect(201)

    const blogsAfterAdd = await helper.blogsInDb()
    assert.strictEqual(blogsAfterAdd.length, blogsAtStart.length + 1)

    await api
      .delete(`/api/blogs/${postResponse.body.id}`)
      .set('Authorization', `Bearer ${rootUser.token}`)
      .expect(204)

    const blogsAfterDelete = await helper.blogsInDb()
    assert.strictEqual(blogsAfterDelete.length, blogsAtStart.length)
  })

  test('blog likes can be updated', async () => {
    const newBlog = {
      title: 'Test Blog',
      author: 'Test Author',
      url: 'https://testblog.com',
      likes: 0,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${rootUser.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogs = await helper.blogsInDb()
    const addedBlog = blogs.find(
      (blog) => blog.title + blog.author === newBlog.title + newBlog.author
    )
    assert.strictEqual(addedBlog.likes, 0)
    assert.strictEqual(blogs.length, helper.blogs.length + 1)

    await api
      .put(`/api/blogs/${addedBlog.id}`)
      .set('Authorization', `Bearer ${rootUser.token}`)
      .send({
        ...addedBlog,
        likes: 10,
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)
    const blogsUpdated = await helper.blogsInDb()
    const updatedBlog = blogsUpdated.find(
      (blog) => blog.title + blog.author === newBlog.title + newBlog.author
    )
    assert.strictEqual(updatedBlog.likes, 10)
    assert.strictEqual(blogsUpdated.length, helper.blogs.length + 1)
  })
})

test('user cannot delete another user\'s blog', async () => {
  await api
    .post('/api/users')
    .send({
      username: 'otheruser',
      name: 'Other User',
      password: 'otherpassword',
    })
    .expect(201)

  const result = await api
    .post('/api/login')
    .send({ username: 'otheruser', password: 'otherpassword' })
    .expect(200)
    .expect('Content-Type', /application\/json/)
  const otherToken = result.body.token

  const newBlog = {
    title: 'Root User Blog',
    author: 'Root',
    url: 'https://rootblog.com',
    likes: 0,
  }
  const postResponse = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${rootUser.token}`)
    .send(newBlog)
    .expect(201)

  const deleteRes = await api
    .delete(`/api/blogs/${postResponse.body.id}`)
    .set('Authorization', `Bearer ${otherToken}`)
    .expect(403)

  assert(deleteRes.body.error.includes('only the creator can delete'))

  const blogsAfter = await helper.blogsInDb()
  const exists = blogsAfter.some((b) => b.id === postResponse.body.id)
  assert.strictEqual(exists, true)

  await User.deleteOne({ username: 'otheruser' })
})

describe('Blog: Statistics', () => {
  describe('total likes', () => {
    test('of empty list is zero', () => {
      assert.strictEqual(listHelper.totalLikes([]), 0)
    })

    test('when list has only one blog equals the likes of that', () => {
      const blog = helper.blogs[0]
      const result = listHelper.totalLikes([blog])
      assert.strictEqual(result, blog.likes)
    })

    test('of a bigger list is calculated right', () => {
      assert.strictEqual(listHelper.totalLikes(helper.blogs), 36)
    })
  })

  describe('Favorite blog', () => {
    test('of empty list is null', () => {
      assert.strictEqual(listHelper.favoriteBlog([]), null)
    })

    test('when list has only one blog equals that', () => {
      const blog = helper.blogs[0]
      const result = listHelper.favoriteBlog([blog])
      assert.strictEqual(result, blog)
    })

    test('of a bigger list is calculated right', () => {
      const result = listHelper.favoriteBlog(helper.blogs)
      assert.strictEqual(result, helper.blogs[2])
    })
  })

  describe('Most blogs', () => {
    test('of empty list is null', () => {
      assert.strictEqual(listHelper.mostBlogs([]), null)
    })

    test('when list has only one blog equals that', () => {
      const blog = helper.blogs[0]
      const result = listHelper.mostBlogs([blog])
      assert.deepStrictEqual(result, { author: blog.author, blogs: 1 })
    })

    test('of a bigger list is calculated right', () => {
      const result = listHelper.mostBlogs(helper.blogs)
      assert.deepStrictEqual(result, { author: 'Robert C. Martin', blogs: 3 })
    })
  })

  describe('Most blogs (Lodash)', () => {
    test('of empty list is null', () => {
      assert.strictEqual(listHelper.mostBlogsLodash([]), null)
    })

    test('when list has only one blog equals that', () => {
      const blog = helper.blogs[0]
      const result = listHelper.mostBlogsLodash([blog])
      assert.deepStrictEqual(result, { author: blog.author, blogs: 1 })
    })

    test('of a bigger list is calculated right', () => {
      const result = listHelper.mostBlogsLodash(helper.blogs)
      assert.deepStrictEqual(result, { author: 'Robert C. Martin', blogs: 3 })
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
