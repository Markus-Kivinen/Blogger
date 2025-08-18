const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', middleware.UserExtractor, async (request, response) => {
  const { title, author } = request.body
  const user = request.user
  const existing = await Blog.findOne({ title, author }).populate('user', { username: 1, name: 1 })
  if (existing) {
    return response.status(400).json({
      error: `Blog ${existing.title} By: ${existing.author} already exists`,
      blog: existing,
    })
  }

  const blog = new Blog({ ...request.body, user: user._id })
  const saved = await blog.save()
  user.blogs = [...user.blogs, blog._id]
  await user.save()
  await saved.populate('user', { username: 1, name: 1 })
  response.status(201).json(saved)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 })
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.delete(
  '/:id',
  middleware.UserExtractor,
  async (request, response) => {
    const user = request.user
    const blog = await Blog.findById(request.params.id)
    if (!blog) {
      return response.status(404).json({ error: 'Blog not found' })
    }

    if (blog.user.toString() !== user._id.toString()) {
      return response
        .status(403)
        .json({ error: 'only the creator can delete' })
    }

    user.blogs = user.blogs.filter((b) => b.toString() !== blog._id.toString())
    await user.save()

    await Blog.findByIdAndDelete(blog._id)
    return response.status(204).end()
  }
)

blogsRouter.put('/:id', middleware.UserExtractor, async (request, response) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: 'Blog not found' })
  }

  if (request.body.likes > blog.likes) {
    blog.likedBy = blog.likedBy || []
    const userIdStr = user.id.toString()
    const alreadyLiked = blog.likedBy.some(
      (id) => id.toString() === userIdStr
    )
    if (alreadyLiked) {
      return response
        .status(400)
        .json({ error: 'You have already liked this blog' })
    }
    blog.likedBy.push(user.id)
    blog.likes = request.body.likes
    const updatedBlog = await blog.save()
    await updatedBlog.populate('user', { username: 1, name: 1 })
    return response.status(200).json(updatedBlog)
  }

  if (blog.user.toString() !== user.id.toString()) {
    return response.status(403).json({ error: 'only the creator can update' })
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    request.body,
    {
      returnDocument: 'after',
      runValidators: true,
      context: 'query',
    }
  ).populate('user', { username: 1, name: 1 })

  response.status(200).json(updatedBlog)
})

module.exports = blogsRouter
