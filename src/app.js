import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import { blogsRouter } from './routes/blogs.js'
import { env } from './utils/env.js'

export const app = express()

mongoose.connect(env.MONGODB_URI)

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter)
