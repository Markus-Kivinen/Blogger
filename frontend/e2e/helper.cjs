const { expect } = require('@playwright/test')

const loginWith = async (page, username, password)  => {
  await page.getByRole('button', { name: 'Log in' }).click()
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page.getByText(`Logged in as ${username}`)).toBeVisible()
}


const createBlog = async (page, content) => {
  await page.getByRole('button', { name: 'New Blog' }).click()
  await page.getByTestId('title').fill(content.title)
  await page.getByTestId('author').fill(content.author)
  await page.getByTestId('url').fill(content.url)
  await page.getByRole('button', { name: 'Create' }).click()
}

module.exports = {
  loginWith,
  createBlog
}