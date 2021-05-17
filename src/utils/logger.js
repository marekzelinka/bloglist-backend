const logger = {
  info: (...params) => {
    if (process.env.NODE_ENV === 'test') {
      return
    }
    console.log(...params)
  },
  error: (...params) => {
    if (process.env.NODE_ENV === 'test') {
      return
    }
    console.error(...params)
  },
}

module.exports = logger
