const listHelper = require('../utils/list_helper')
const testBlogs = require('./test_blogs.js')

describe('most Likes', () => {
  const blogs = testBlogs.blogs

  test('of mostLikes author with most likes', () => {
    const result = listHelper.mostLikes(blogs)
    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 17,
    })
  })
})
