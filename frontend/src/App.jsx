import { useState, useEffect, useRef } from 'react'
import useNotification from './context/useNotification'
import BlogList from './components/BlogList'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import Toggleable from './components/Toggleable'
import blogService from './services/blogs'
import Notification from './components/Notification'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const { message, notificationState, addNotification } = useNotification()
  const blogformRef = useRef()
  const loginformRef = useRef()

  useEffect(() => {
    blogService.getAll().then((blogs) => {
      setBlogs(blogs)
    })
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogger')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (user) => {
    loginformRef.current.toggleVisibility()
    setUser(user)
  }

  const handleLogout = () => {
    loginformRef.current?.toggleVisibility()
    window.localStorage.removeItem('loggedBlogger')
    setUser(null)
  }

  const addBlog = async (blog) => {
    try {
      blogformRef.current.toggleVisibility()
      let newBlog = await blogService.create(blog)
      setBlogs(blogs.concat(newBlog))
      addNotification(
        `New blog: '${newBlog.title}' by ${newBlog.author} created`,
        'green'
      )
    } catch (error) {
      addNotification(error.response.data.error, 'red')
    }
  }

  const handleLike = async (blog) => {
    try {
      const updatedBlog = await blogService.update(blog.id, {
        ...blog,
        likes: blog.likes + 1,
        user: blog.user.id,
      })
      setBlogs(blogs.map((b) => (b.id === blog.id ? updatedBlog : b)))
      addNotification(`you liked ${blog.title}`, 'green')
    } catch (error) {
      addNotification(error.response.data.error, 'red')
    }
  }

  const handleDelete = async (blog) => {
    if (!window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) return
    try {
      await blogService.deleteObject(blog.id)
      setBlogs(blogs.filter((b) => b.id !== blog.id))
      addNotification(`Deleted ${blog.title}`, 'green')
    } catch (error) {
      addNotification(error.response.data.error, 'red')
    }
  }

  return (
    <>
      <Notification message={message} state={notificationState} />
      {!user ? (
        <div id="loginForm">
          <Toggleable
            buttonLabel="Log in"
            cancelLabel="Cancel"
            ref={loginformRef}
            inline={true}
          >
            <LoginForm login={handleLogin} />
          </Toggleable>
        </div>
      ) : (
        <>
          <div id="loginForm">
            <div>
              <p>
                {`Logged in as ${user.username} `}{' '}
                <button onClick={handleLogout}>Log out</button>
              </p>
            </div>
          </div>
          <div id="blogForm">
            <Toggleable
              buttonLabel="New Blog"
              cancelLabel="Cancel"
              ref={blogformRef}
            >
              <BlogForm submit={addBlog} />
            </Toggleable>
          </div>
        </>
      )}
      <div id="blogList">
        <h1>Blogs</h1>
        <BlogList
          blogs={blogs}
          onLike={handleLike}
          user={user}
          onDelete={handleDelete}
        />
      </div>
    </>
  )
}

export default App
