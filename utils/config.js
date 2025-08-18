require('dotenv').config()

const PORT = process.env.PORT
const MONGODB_URI = ['development', 'test'].includes(process.env.NODE_ENV)
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI
const NODE_ENV = process.env.NODE_ENV

module.exports = { MONGODB_URI, PORT, NODE_ENV }