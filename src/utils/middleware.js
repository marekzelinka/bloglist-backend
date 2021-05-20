const logger = require('./logger')

const middleware = {
  reqLogger: (req, _res, next) => {
    logger.info('Method:', req.method)
    logger.info('Path:', req.path)
    logger.info('Body:', req.body)
    logger.info('---')
    next()
  },
  unknowEndpoint: (_req, res) => {
    res.status(404).json({ error: 'unknown endpoint' })
  },
  tokenExtractor: (req, _res, next) => {
    const authorization = req.get('authorization')
    if (authorization === undefined) {
      next()
      return
    } else if (!authorization.toLowerCase().startsWith('bearer')) {
      next()
      return
    }

    const token = authorization.substring(7)
    req.token = token

    next()
  },
  errorHandler: (error, _req, res, next) => {
    logger.error(error.message)

    if (error.name === 'CastError') {
      res.status(400).json({ error: 'malformatted id' })
      return
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message })
      return
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        error: 'invalid token',
      })
      return
    }

    next(error)
  },
}

module.exports = middleware
