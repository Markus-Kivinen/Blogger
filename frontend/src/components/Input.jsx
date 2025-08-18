/**
 * @param {Object} props
 * @param {string} props.text
 * @param {string} props.id
 * @param {string} props.placeholder
 * @param {string} props.style,
 * @param {boolean} props.inline
 * @param {function(Event): void} props.onChange
 * @param {string} props.value
 * @returns {JSX.Element}
 */
const Input = ({ text, id, onChange, value, style, inline, placeholder }) => (
  <>
    <label htmlFor={id} style={style}>{text}</label>
    <input id={id} data-testid={id} onChange={onChange} value={value} placeholder={placeholder}/>
    {!inline && <br />}
  </>
)

export default Input
