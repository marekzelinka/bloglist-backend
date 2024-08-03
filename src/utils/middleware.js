import { logError } from './logger.js'

export function unknownEndpoint(_req, res) {
  res.status(404).send({ error: 'unknown endpoint' })
}

export function errorHandler(error, _req, res, next) {
  logError(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  } else if (
    error.name === 'MongoServerError' &&
    error.message.includes('E11000 duplicate key error')
  ) {
    return res.status(400).json({ error: 'expected `username` to be unique' })
  } else if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'token invalid' })
  } else if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'token expired',
    })
  }

  next(error)
}

export function tokenExtractor(req, _res, next) {
  const token = getTokenFrom(req)
  req.token = token ?? ''

  next()
}

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}
