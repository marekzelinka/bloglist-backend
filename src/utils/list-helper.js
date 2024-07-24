export function dummy(_blogs) {
  return 1
}

export function totalLikes(blogs) {
  return blogs.reduce((total, blog) => total + blog.likes, 0)
}
