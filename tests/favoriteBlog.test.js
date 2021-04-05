const listHelper = require('../utils/list_helper')
const testBlogs = require('./test_blogs.js')

describe('favorite Blog', () => {
  const blogs = testBlogs.blogs

  test('4.5 - of favoriteBlog with most likes', () => {
    const result = listHelper.favoriteBlog(blogs)
    expect(result).toEqual({
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12,
    })
  })
})
