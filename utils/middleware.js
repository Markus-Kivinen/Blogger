const logger = require('./logger')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (
    error.name === 'MongoServerError' &&
    error.message.includes('E11000 duplicate key error')
  ) {
    return response
      .status(400)
      .json({ error: 'expected `username` to be unique' })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'token missing or invalid' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired',
    })
  }
  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  } else {
    request.token = null
  }
  next()
}

const UserExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)
  if (!user) {
    request.user = null
    return response.status(400).json({ error: 'userId missing or not valid' })
  }
  request.user = user
  next()
}

var morgan = require('morgan')
morgan.token('body', function (req) {
  // morgan korvaa "":n viivalla, trimmaus poistaa lisätyn välin stream:writessa
  return JSON.stringify(req.body) || ' '
})

module.exports = {
  requestLogger: morgan(
    ':method :url :status :res[content-length] - :response-time ms :body',
    {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }
  ),
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  UserExtractor,
}
