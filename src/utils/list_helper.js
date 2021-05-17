const listHelper = {
  dummy: (blogs) => {
    blogs
    return 1
  },
  totalLikes: (blogs) =>
    blogs.length > 0
      ? blogs.reduce((totalLikes, blog) => totalLikes + blog.likes, 0)
      : 0,
  favoriteBlog: (blogs) => {
    if (blogs.length === 0) {
      return null
    }

    let currentBlog = blogs[0]

    for (const blog of blogs) {
      if (blog.likes > currentBlog.likes) {
        currentBlog = blog
      }
    }

    return {
      title: currentBlog.title,
      author: currentBlog.author,
      likes: currentBlog.likes,
    }
  },
  mostBlogs: (blogs) => {
    if (blogs.length === 0) {
      return null
    }

    const stats = blogs.reduce((ret, blog) => {
      ret[blog.author] =
        ret[blog.author] === undefined ? 1 : ret[blog.author] + 1
      return ret
    }, {})

    const mostBlogs = Object.entries(stats).reduce((mostBlogs, stat) =>
      stat[1] > mostBlogs[1] ? (mostBlogs = stat) : mostBlogs
    )

    return {
      author: mostBlogs[0],
      blogs: mostBlogs[1],
    }
  },
  mostLikes: (blogs) => {
    if (blogs.length === 0) {
      return null
    }

    let stats = blogs.reduce((ret, blog) => {
      ret[blog.author] =
        ret[blog.author] === undefined
          ? blog.likes
          : ret[blog.author] + blog.likes
      return ret
    }, {})

    const mostLikes = Object.entries(stats).reduce((mostBlogs, stat) =>
      stat[1] > mostBlogs[1] ? (mostBlogs = stat) : mostBlogs
    )

    return {
      author: mostLikes[0],
      likes: mostLikes[1],
    }
  },
}

module.exports = listHelper
