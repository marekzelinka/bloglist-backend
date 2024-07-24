export function dummy(_blogs) {
  return 1
}

export function totalLikes(blogs) {
  return blogs.reduce((total, blog) => total + blog.likes, 0)
}

export function favoriteBlog(blogs) {
  const maxLikes = Math.max(...blogs.map((blog) => blog.likes))
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
