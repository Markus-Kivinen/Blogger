import Blog from './Blog'


const BlogList = ({ user, blogs, onLike, onDelete }) => {
  blogs.sort((a, b) => b.likes - a.likes)
  return (
    <div className="blog-list">
      {blogs.map((blog) => (
        <Blog
          key={blog.id}
          user={user}
          blog={blog}
          onLike={() => onLike(blog)}
          onDelete={() => onDelete(blog)}
        />
      ))}
    </div>
  )
}

export default BlogList
