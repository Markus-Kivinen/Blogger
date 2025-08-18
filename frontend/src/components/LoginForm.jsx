import Input from './Input'
import { useState } from 'react'
import loginService from '../services/login'
import blogService from '../services/blogs'
import useNotification from '../context/useNotification'

/**
 * @typedef {Object} LoginFormProps
 * @property {boolean} loginVisible
 * @property {Object} user
 * @property {import('../config/buttonConfig').ButtonConfig} login
 * @property {import('../config/buttonConfig').ButtonConfig} cancel
 * @property {import('../config/buttonConfig').ButtonConfig} logout
 * @property {import('../config/inputConfig').InputConfig} username
 * @property {import('../config/inputConfig').InputConfig} password
 */

/**
 * @param {LoginFormProps} props
 * @returns {JSX.Element}
 */
const LoginForm = ({ login }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { addNotification } = useNotification()

  const onChange = ({ target: { id, value } }) => {
    const config = inputConfigs[id]
    config.setter(value)
  }
  const inputConfigs = {
    username: {
      id: 'username',
      text: 'name ',
      value: username,
      onChange: onChange,
      inline: false,
      setter: setUsername,
      style: { width: '65px', display: 'inline-block' },
    },
    password: {
      id: 'password',
      text: 'password ',
      value: password,
      onChange: onChange,
      inline: false,
      setter: setPassword,
      style: { width: '65px', display: 'inline-block' },
    },
  }

  const handleLogin = async (evt) => {
    evt.preventDefault()
    try {
      const user = await loginService.login({
        username,
        password,
      })
      login(user)
      window.localStorage.setItem('loggedBlogger', JSON.stringify(user))
      blogService.setToken(user.token)
      setUsername('')
      setPassword('')
    } catch (error) {
      addNotification(error.response.data.error, 'red')
    }
  }

  return (
    <>
      <h2>Login</h2>
      <form id="login-form" onSubmit={login}>
        <Input {...inputConfigs.username} />
        <Input {...inputConfigs.password} />
      </form>
      <button
        type="submit"
        form="login-form"
        style={{ display: 'inline', marginRight: '5px', marginTop: '5px' }}
        onClick={handleLogin}
      >
        Log in
      </button>
    </>
  )
}

export default LoginForm
