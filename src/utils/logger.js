const logger = {
  info: (...params) => {
    if (process.env.NODE_ENV === 'test') {
      return
    }
    console.log(...params)
  },
  error: (...params) => {
    console.error(...params)
  },
}

module.exports = logger
