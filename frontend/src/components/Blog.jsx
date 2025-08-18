import Toggleable from './Toggleable'

const Blog = ({ blog, user, onLike, onDelete }) => {
  return (
    <div
      className="blog"
      style={{
        marginBottom: '10px',
        padding: '10px',
        border: '1px solid black',
      }}>
      <h3 id="title" style={{ display: 'inline', paddingRight: '5px' }}>{blog.title}</h3>
      <Toggleable beforeChildren={true} buttonLabel="View" cancelLabel="Hide" inline={true}>
        <p>
          <a id="url" href={blog.url}>{blog.url}</a>
          <br />
          <span id="likes" data-testid="likes">{blog.likes} likes <button onClick={onLike}>Like</button></span>
          <br />
          <span id="author">{blog.author}</span>
          <br />
          {user && blog.user && user.id === blog.user.id && (
            <button
              style={{
                color: 'white',
                backgroundColor: '#1976d2',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '4px',
              }}
              onClick={onDelete}
            >
              Remove
            </button>
          )}
        </p>
      </Toggleable>
    </div>
  )
}

export default Blog