const lodash = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  if (blogs.length === 0) {
    return 0
  }

  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

/**
 * @param {Array.<Object>} blogs
 */
const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const blog = blogs.reduce((prev, current) => {
    return (prev.likes > current.likes) ? prev : current
  }, blogs[0])
  return blog
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const res = blogs.reduce((acc, { author }) => {
    acc[author] = (acc[author] || 0) + 1
    return acc
  }, {})
  const most = Object.entries(res).reduce((prev, current) =>
    (prev[1] > current[1]) ? prev : current
  )
  return { author: most[0], blogs: most[1] }
}

const mostBlogsLodash = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const res = lodash.countBy(blogs, 'author')
  const most = lodash.maxBy(Object.entries(res), ([, count]) => count)
  return { author: most[0], blogs: most[1] }
}

module.exports = { totalLikes, dummy, favoriteBlog, mostBlogs, mostBlogsLodash }
