const _ = require('lodash')

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => 1

const totalLikes = (blogs) =>
  blogs.reduce((totalLikes, blog) => totalLikes + blog.likes, 0)

const toJSON = (returnedObject) => ({
  title: returnedObject.title,
  author: returnedObject.author,
  likes: returnedObject.likes,
})

const favoriteBlog = (blogs) =>
  toJSON(
    blogs.reduce((favoriteBlog, blog) =>
      favoriteBlog.likes <= blog.likes ? blog : favoriteBlog
    )
  )

const mostBlogs = (blogs) =>
  _(blogs)
    .countBy('author')
    .map((objs, key) => ({
      author: key,
      blogs: objs,
    }))
    .maxBy('blogs')

const mostLikes = (blogs) =>
  _(blogs)
    .groupBy('author')
    .map((objs, key) => ({
      author: key,
      likes: _.sumBy(objs, 'likes'),
    }))
    .maxBy('likes')

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
