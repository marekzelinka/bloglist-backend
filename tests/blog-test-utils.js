import { Blog } from '../src/models/blog.js'
import { User } from '../src/models/user.js'

export const initialBlogs = [
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
]

export async function blogsInDb() {
  const blogs = await Blog.find()
  return blogs.map((blog) => blog.toJSON())
}

export async function usersInDb() {
  const users = await User.find({})
  return users.map((u) => u.toJSON())
}
