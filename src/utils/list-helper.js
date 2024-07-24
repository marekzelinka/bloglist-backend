import _ from 'lodash'

export function dummy(_blogs) {
  return 1
}

export function totalLikes(blogs) {
  return blogs.reduce((total, blog) => total + blog.likes, 0)
}

export function favoriteBlog(blogs) {
  const maxLikes = blogs.length
    ? Math.max(...blogs.map((blog) => blog.likes))
    : 0
  const favorite = blogs.find((blog) => blog.likes === maxLikes)
  if (!favorite) {
    return null
  }

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes,
  }
}

export function mostBlogs(blogs) {
  if (!blogs.length) {
    return null
  }

  const countedByBlogCount = _.countBy(blogs, (blog) => blog.author)
  const [author, blogsCount] = _.maxBy(
    _.toPairs(countedByBlogCount),
    ([, count]) => count,
  )

  return { author, blogs: blogsCount }
}
