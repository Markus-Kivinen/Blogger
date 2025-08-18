import { useState, useImperativeHandle, forwardRef } from 'react'

const Toggleable = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false)
  const visibleStyle = {
    display: visible ? '' : 'none',
  }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  useImperativeHandle(ref, () => {
    return { toggleVisibility }
  })

  const Wrapper = props.inline ? 'span' : 'div'

  return (
    <Wrapper className="togglableContent">
      {props.beforeChildren === true && (
        <>
          <button onClick={toggleVisibility}>
            {visible ? props.cancelLabel : props.buttonLabel}
          </button>
          <Wrapper className="toggleContent" style={visibleStyle}>{props.children}</Wrapper>
        </>
      )}
      {props.beforeChildren !== true && (
        <>
          <Wrapper className="toggleContent" style={visibleStyle}>{props.children}</Wrapper>
          <button onClick={toggleVisibility}>
            {visible ? props.cancelLabel : props.buttonLabel}
          </button>
        </>
      )}
    </Wrapper>
  )
})

Toggleable.displayName = 'Togglable'

export default Toggleable