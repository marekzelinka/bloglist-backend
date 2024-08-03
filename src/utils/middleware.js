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
    return response
      .status(400)
      .json({ error: 'expected `username` to be unique' })
  }

  next(error)
}
