import Input from './Input'
import { useState } from 'react'

/**
 * @param {Object} props
 * @param {function} props.submit
 * @returns {JSX.Element}
 */
const BlogForm = ({ submit }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const addBlog = (evt) => {
    evt.preventDefault()
    const blog = {
      author: author,
      title: title,
      url: url,
    }
    setTitle('')
    setAuthor('')
    setUrl('')
    submit(blog)
  }

  const onChange = ({ target: { id, value } }) => {
    const config = inputConfigs[id]
    config.setter(value)
  }

  const inputConfigs = {
    title: {
      id: 'title',
      text: 'title: ',
      value: title,
      onChange: onChange,
      inline: false,
      setter: setTitle,
      placeholder: 'title of the blog',
      style: { width:'60px', display: 'inline-block' }
    },
    author: {
      id: 'author',
      text: 'author: ',
      value: author,
      onChange: onChange,
      inline: false,
      setter: setAuthor,
      placeholder: 'author of the blog',
      style: { width:'60px', display: 'inline-block' }
    },
    url: {
      id: 'url',
      text: 'url: ',
      value: url,
      onChange: onChange,
      inline: false,
      setter: setUrl,
      placeholder: 'url of the blog',
      style: { width:'60px', display: 'inline-block' }
    },
  }

  return (
    <>
      <h2>Create new</h2>
      <form onSubmit={addBlog}>
        <Input {...inputConfigs.title} />
        <Input {...inputConfigs.author} />
        <Input {...inputConfigs.url} />
        <button type="submit">Create</button>
      </form>
    </>
  )
}

export default BlogForm
