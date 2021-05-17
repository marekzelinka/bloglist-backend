require('dotenv').config()

const config = {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  TEST_MONGODB_URI: process.env.TEST_MONGODB_URI,
}

for (const [key, value] of Object.entries(config)) {
  if (value === undefined) {
    throw new Error(`Define the ${key} env var.`)
  }
}

config.MONGODB_URI =
  process.env.NODE_ENV !== 'test' ? config.MONGODB_URI : config.TEST_MONGODB_URI

module.exports = config
