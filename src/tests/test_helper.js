const Blog = require('../models/blog')
const User = require('../models/user')

const testHelper = {
  initialBlogs: [
    {
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 7,
    },
    {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
    },
  ],
  blogsInDb: async () => {
    const blogs = await Blog.find()
    return blogs.map((blog) => blog.toJSON())
  },
  usersInDb: async () => {
    const users = await User.find()
    return users.map((user) => user.toJSON())
  },
  authToken: async (api) => {
    const loginCredentials = {
      username: 'root',
      password: 'sekret',
    }
    const loginPostRes = await api.post('/api/login').send(loginCredentials)
    const token = loginPostRes.body.token

    return token
  },
  initialUser: { username: 'root', password: 'sekret' },
}

module.exports = testHelper
