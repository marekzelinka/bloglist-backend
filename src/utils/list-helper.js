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

  const authorCounts = blogs.reduce((authorCount, blog) => {
    authorCount[blog.author] = (authorCount[blog.author] || 0) + 1
    return authorCount
  }, {})
  const maxCount = Math.max(...Object.values(authorCounts))
  const mostFrequent = Object.keys(authorCounts).filter(
    (author) => authorCounts[author] === maxCount,
  )

  return {
    author: mostFrequent[0],
    blogs: maxCount,
  }
}

export function mostLikes(blogs) {
  if (!blogs.length) {
    return null
  }

  const authorsByLikes = blogs.reduce((likesCount, blog) => {
    likesCount[blog.author] = (likesCount[blog.author] || 0) + blog.likes
    return likesCount
  }, {})
  const maxCount = Math.max(...Object.values(authorsByLikes))
  const mostFrequent = Object.keys(authorsByLikes).filter(
    (author) => authorsByLikes[author] === maxCount,
  )

  return {
    author: mostFrequent[0],
    likes: maxCount,
  }
}
