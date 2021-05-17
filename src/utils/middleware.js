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
  errorHandler: (error, _req, res, next) => {
    logger.error(error.message)

    if (error.name === 'CastError') {
      res.status(400).json({ error: 'malformatted id' })
      return
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message })
      return
    }

    next(error)
  },
}

module.exports = middleware
