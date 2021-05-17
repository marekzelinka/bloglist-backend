const middleware = {
  reqLogger: (req, _res, next) => {
    console.log('Method:', req.method)
    console.log('Path:', req.path)
    console.log('Body:', req.body)
    console.log('---')
    next()
  },
  unknowEndpoint: (_req, res) => {
    res.status(404).json({ error: 'unknown endpoint' })
  },
  errorHandler: (error, _req, res, next) => {
    console.error(error.message)

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
