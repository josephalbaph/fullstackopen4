const listHelper = require('../utils/list_helper')

test('4.3 - dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})
