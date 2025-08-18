const Notification = ({ message, state: { visible, color } }) => {
  const notificationStyle = {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: color,
    background: 'lightgrey',
    fontSize: '20px',
    borderStyle: 'solid',
    borderRadius: '5px',
    width: '80%',
    padding: '10px',
    marginBottom: '10px',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.5s ease-in-out',
  }

  return message && <div className='error' style={notificationStyle}>{message}</div>
}

export default Notification
