const { test, describe, expect, beforeEach } = require('@playwright/test')
const helper = require('./helper')

const testUser = {
  username: 'Maketti-Spaghetti',
  name: 'Make',
  password: 'SeekritKey'
}

const sockPuppet = {
  username: 'Maketti-testi',
  name: 'Make',
  password: 'SeekritKey'
}

const testblog = {
  title: 'a blog created by playwright',
  author: 'Playwright',
  url: 'http://localhost:5173'
}

test.beforeAll(async ({ request }) => {
  console.log('Resetting database and creating test users')
  await request.post('/api/testing/reset')
  await request.post('/api/users', {
    data: testUser
  })
  await request.post('/api/users', {
    data: sockPuppet
  })
})


describe('Blog app', () => {
  test.beforeEach(async ({ page, request }) => {
    await page.goto('/')
  })

  test('front page can be opened', async ({ page }) => {
    const locator = page.getByText('Blogs')
    await expect(locator).toBeVisible()
    await expect(page.getByText('Blogs')).toBeVisible()
  })

  test('login form can be opened', async ({ page }) => {
    await page.getByRole('button', { name: 'Log in' }).click()
    const locator = page.getByLabel('name ')
    await expect(locator).toBeVisible()
  })

  test('user can login', async ({ page }) => {
    await page.getByRole('button', { name: 'Log in' }).click()

    await page.getByTestId('username').fill(testUser.username)
    await page.getByTestId('password').fill(testUser.password)
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page.getByText(`Logged in as ${testUser.username}`)).toBeVisible()
  })


  test('login fails with wrong password', async ({ page }) => {
    await page.getByRole('button', { name: 'Log in' }).click()
    await page.getByTestId('username').fill(testUser.username)
    await page.getByTestId('password').fill(testUser.password+'but_wrong')
    await page.getByRole('button', { name: 'Log in' }).click()

    const errorDiv = page.locator('.error')
    await expect(errorDiv).toContainText('invalid username or password')
    await expect(errorDiv).toHaveCSS('border-style', 'solid')
    await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
    await expect(page.getByText(`Logged in as ${testUser.username}`)).toBeHidden()
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await helper.loginWith(page, testUser.username, testUser.password)
      await expect(page.getByText(`Logged in as ${testUser.username}`)).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      await helper.createBlog(page, testblog)
      await expect(page.getByRole('heading', { name: 'a blog created by playwright' })).toBeVisible()
      const errorDiv = page.locator('.error')
      await expect(errorDiv).toContainText(`New blog: '${testblog.title}' by ${testblog.author} created`)
      await expect(errorDiv).toHaveCSS('border-style', 'solid')
      await expect(errorDiv).toHaveCSS('color', 'rgb(0, 128, 0)')
    })

    test('Blog can be liked', async ({ page }) => {
      const blog = page.locator('.blog').filter({ has: page.getByRole('heading', { name: 'a blog created by playwright' }) })
      await blog.getByRole('button', { name: 'View' }).click()
      await expect(blog.getByText('0 likes')).toBeVisible()
      await blog.getByRole('button', { name: 'Like' }).click()
      await expect(blog.getByTestId('likes')).toContainText(/1.* likes/)
    })

    test('Blog can not be liked twice', async ({ page }) => {
      const blog = page.locator('.blog').filter({ has: page.getByRole('heading', { name: 'a blog created by playwright' }) })
      await blog.getByRole('button', { name: 'View' }).click()
      await expect(blog.getByText('1 likes')).toBeVisible()
      await blog.getByRole('button', { name: 'Like' }).click()
      const errorDiv = page.locator('.error')
      await expect(errorDiv).toContainText('You have already liked this blog')
      await expect(errorDiv).toHaveCSS('border-style', 'solid')
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
    })

    test('Can not delete others blog', async ({ page }) => {
      const blog = page.locator('.blog').filter({ has: page.getByRole('heading', { name: 'a blog created by playwright' }) })
      await page.getByRole('button', { name: 'Log out' }).click()
      await helper.loginWith(page, sockPuppet.username, sockPuppet.password)
      await expect(page.getByText(`Logged in as ${sockPuppet.username}`)).toBeVisible()
      await blog.getByRole('button', { name: 'View' }).click()
      await expect(blog.getByRole('button', { name: 'Remove' })).toBeHidden()
      await expect(blog.getByText('a blog created by playwright')).toBeVisible()
    })

    test('Blog can be deleted', async ({ page }) => {
      const blog = page.locator('.blog').filter({ has: page.getByRole('heading', { name: 'a blog created by playwright' }) })
      await blog.getByRole('button', { name: 'View' }).click()
      page.once('dialog', dialog => dialog.accept())
      await blog.getByRole('button', { name: 'Remove' }).click()
      await expect(blog).toHaveCount(0)
    })

    test('Multiple blogs can exist', async ({ page }) => {
      await helper.createBlog(page, { title: 'First blog', author: 'Author 1', url: 'www.google.com' })
      await expect(page.getByRole('heading', { name: 'First blog' })).toBeVisible()
      await helper.createBlog(page, { title: 'Second blog', author: 'Author 2', url: 'www.stackoverflow.com' })
      await expect(page.getByRole('heading', { name: 'Second blog' })).toBeVisible()
      await helper.createBlog(page, { title: 'Third blog', author: 'Author 3', url: 'www.chatGPT.com' })
      await expect(page.getByRole('heading', { name: 'Third blog' })).toBeVisible()

      const blogs = page.locator('.blog')
      await expect(blogs).toHaveCount(3)
    })

    // Likes are limited to one per user per blog, so need to switch user to test likes
    test('blogs are ordered by likes', async ({ page }) => {
      const blogs = page.locator('.blog')
      const firstblog = page.locator('.blog').filter({ has: page.getByRole('heading', { name: 'First blog' }) })
      const secondBlog = page.locator('.blog').filter({ has: page.getByRole('heading', { name: 'Second blog' }) })
      const thirdBlog = page.locator('.blog').filter({ has: page.getByRole('heading', { name: 'Third blog' }) })
      await expect(blogs).toHaveCount(3)

      await thirdBlog.getByRole('button', { name: 'View' }).click()
      await thirdBlog.getByRole('button', { name: 'Like' }).click()
      await expect(page.getByText('You liked Third blog')).toBeVisible()

      await secondBlog.getByRole('button', { name: 'View' }).click()
      await secondBlog.getByRole('button', { name: 'Like' }).click()
      await expect(page.getByText('You liked Second blog')).toBeVisible()
      await page.getByText('You liked Second blog').waitFor({ state: 'hidden' })

      // switch user
      await page.getByRole('button', { name: 'Log out' }).click()
      await helper.loginWith(page, sockPuppet.username, sockPuppet.password)
      await secondBlog.getByRole('button', { name: 'Like' }).click()
      await expect(page.getByText('You liked Second blog')).toBeVisible()

      const likes = [
        Number((await firstblog.getByTestId('likes').textContent()).match(/\d+/)[0]),
        Number((await secondBlog.getByTestId('likes').textContent()).match(/\d+/)[0]),
        Number((await thirdBlog.getByTestId('likes').textContent()).match(/\d+/)[0])
      ]
      console.log(likes)
      expect(likes).toEqual([0, 2, 1])
    })
  })
})