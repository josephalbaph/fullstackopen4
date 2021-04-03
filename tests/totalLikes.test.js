const listHelper = require('../utils/list_helper')
const testBlogs = require('./test_blogs.js')

describe('total likes', () => {
  const listWithOneBlog = testBlogs.listWithOneBlog
  const blogs = testBlogs.blogs

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    expect(result).toBe(5)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(blogs)
    expect(result).toBe(36)
  })
})
