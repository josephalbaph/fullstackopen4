const _ = require('lodash')

// 4.3 First define a dummy function that receives
//     an array of blog posts as a parameter and always returns the value 1
// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => 1

// 4.4: receives a list of blog posts returns the total sum of likes 
//      in all of the blog posts.
const totalLikes = (blogs) =>
  blogs.reduce((totalLikes, blog) => totalLikes + blog.likes, 0)

const toJSON = (returnedObject) => ({
  title: returnedObject.title,
  author: returnedObject.author,
  likes: returnedObject.likes,
})

// 4.5: receives a list of blogs, finds out which blog has most likes.
const favoriteBlog = (blogs) =>
  toJSON(
    blogs.reduce((favoriteBlog, blog) =>
      favoriteBlog.likes <= blog.likes ? blog : favoriteBlog
    )
  )

// 4.6: receives an array of blogs
//      returns the author who has the largest amount of blogs.
//      The return value also contains the number of blogs the top author has
const mostBlogs = (blogs) =>
  _(blogs)
    .countBy('author')
    .map((objs, key) => ({
      author: key,
      blogs: objs,
    }))
    .maxBy('blogs')

// 4.7 - receives an array of blogs 
//       returns the author, whose blog posts have the largest amount of likes.
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
