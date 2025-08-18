import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from '../src/components/Blog'
import Togglable from '../src/components/Toggleable'

afterEach(() => {
  cleanup()
})

const blog = {
  title: 'Component testing is done with react-testing-library',
  author: 'Make',
  likes: 32,
  url: 'https://www.example.com',
  user: {
    id: '12345',
    name: 'Test User',
  },
}

test('renders title', () => {
  const { container } = render(<Blog blog={blog} />)
  // screen.debug()
  const div = container.querySelector('.blog')
  const title = div.querySelector('#title')
  expect(title).toHaveTextContent(blog.title)
})

test('renders all content', () => {
  const { container } = render(<Blog blog={blog} />)
  // screen.debug()
  const blogElement = container.querySelector('.blog')

  const title = blogElement.querySelector('#title')
  expect(title).toHaveTextContent(blog.title)

  const url = blogElement.querySelector('#url')
  expect(url).toHaveTextContent(blog.url)

  const likes = blogElement.querySelector('#likes')
  expect(likes).toHaveTextContent(`${blog.likes} likes`)

  const author = blogElement.querySelector('#author')
  expect(author).toHaveTextContent('Make')
})

test('Has working click handlers', async() => {
  const mockLike = vi.fn()
  const mockDelete = vi.fn()
  const user = userEvent.setup()

  render(<Blog blog={blog} onLike={mockLike} onDelete={mockDelete} user={{ id: '12345' }}/>)

  // Expand the blog to see the details
  const viewButton = screen.getByText('View')
  await user.click(viewButton)

  const likebutton = screen.getByText('Like')
  await user.click(likebutton)
  expect(mockLike.mock.calls).toHaveLength(1)

  const removeButton = screen.getByText('Remove')
  await user.click(removeButton)
  expect(mockDelete.mock.calls).toHaveLength(1)
})

test('Can click click handlers multiple times', async() => {
  const mockLike = vi.fn()
  const mockDelete = vi.fn()
  const user = userEvent.setup()

  render(<Blog blog={blog} onLike={mockLike} onDelete={mockDelete} user={{ id: '12345' }}/>)

  // Expand the blog to see the details
  const viewButton = screen.getByText('View')
  await user.click(viewButton)

  const likebutton = screen.getByText('Like')
  await user.click(likebutton)
  await user.click(likebutton)
  expect(mockLike.mock.calls).toHaveLength(2)

  const removeButton = screen.getByText('Remove')
  await user.click(removeButton)
  await user.click(removeButton)
  expect(mockDelete.mock.calls).toHaveLength(2)
})

describe('<Toggleable />', () => {
  let container

  beforeEach(() => {
    container = render(
      <Togglable buttonLabel="show..." cancelLabel="cancel" inline={true}>
        <div className="testDiv" >
          togglable content
        </div>
      </Togglable>
    ).container
  })

  test('renders its children', () => {
    screen.getByText('togglable content')
    expect(container.querySelector('.testDiv')).toBeDefined()
  })

  test('at start the children are not displayed', () => {
    const wrapper = container.querySelector('.toggleContent')
    expect(wrapper).toHaveStyle('display: none')
  })

  test('after clicking the button, children are displayed', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('show...')
    await user.click(button)

    const wrapper = container.querySelector('.toggleContent')
    expect(wrapper).not.toHaveStyle('display: none')
  })

  test('toggled content can be closed', async () => {
    const user = userEvent.setup()

    const button = screen.getByText('show...')
    await user.click(button)

    const closeButton = screen.getByText('cancel')
    await user.click(closeButton)

    const wrapper = container.querySelector('.toggleContent')
    expect(wrapper).toHaveStyle('display: none')
  })
})