import { createContext, useRef, useState } from 'react'

const NotificationContext = createContext()

export default NotificationContext

export const NotificationProvider = ({ children }) => {
  const [message, setMessage] = useState(null)
  const [notificationState, setNotificationState] = useState({
    visible: false,
    color: 'green',
  })
  const notificationTimeouts = useRef({ fade: null, clear: null })

  /**
   * @param {string} msg
   * @param {string} color
   */
  const addNotification = (msg, color) => {
    clearTimeout(notificationTimeouts.current.fade)
    clearTimeout(notificationTimeouts.current.clear)

    setMessage(msg)
    setNotificationState({ visible: true, color })

    notificationTimeouts.current.fade = setTimeout(() => {
      setNotificationState((prev) => ({
        ...prev,
        visible: false,
      }))
      notificationTimeouts.current.clear = setTimeout(() => {
        setMessage(null)
      }, 500)
    }, 2500)
  }

  return (
    <NotificationContext.Provider
      value={{ message, notificationState, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  )
}