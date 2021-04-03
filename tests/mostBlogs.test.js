const listHelper = require('../utils/list_helper')
const testBlogs = require('./test_blogs.js')

describe('most Blogs', () => {
  const blogs = testBlogs.blogs

  test('of mostBlogs author with most blogs', () => {
    const result = listHelper.mostBlogs(blogs)
    expect(result).toEqual({
      author: 'Robert C. Martin',
      blogs: 3
    })
  })
})
