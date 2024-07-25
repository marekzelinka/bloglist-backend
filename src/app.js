import cors from 'cors'
import express from 'express'
import 'express-async-errors'
import mongoose from 'mongoose'
import { blogsRouter } from './routes/blogs.js'
import { env } from './utils/env.js'
import { errorHandler, unknownEndpoint } from './utils/middleware.js'

export const app = express()

mongoose.connect(env.MONGODB_URI)

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter)

app.use(unknownEndpoint)
// errorHandler needs to be the last loaded middleware
app.use(errorHandler)
