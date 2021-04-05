const supertest = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const api = supertest(app)
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const newUser = {
    username: 'josephalbaph',
    name: 'Joseph Marie Alba',
  }

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ ...newUser, passwordHash })

  await user.save()

  const initialBlogsWithUser = helper.initialBlogs.map((blog) => ({
    ...blog,
    user: user.id,
  }))
  const savedBlogs = await Blog.insertMany(initialBlogsWithUser)
  user.blogs = savedBlogs.map((blog) => blog.id)
  await user.save()

  const secondUser = {
    username: 'seconduser',
    name: 'Second User'
  }

  const secondPasswordHash = await bcrypt.hash('sekret2', 10)
  const user2 = new User({ ...secondUser, passwordHash: secondPasswordHash })

  await user2.save()
})

describe('when there is initially some blogs saved', () => {
  test('4.8 - blog list returns the correct amount of blog posts in JSON format', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('4.9 - blog id is defined', async () => {
    const response = await api.get('/api/blogs')
    for (let blog of response.body) {
      let blogObject = new Blog(blog)
      expect(blogObject.id).toBeDefined()
    }
  })
})

describe('viewing a specific blog', () => {
  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]
    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))
    expect(resultBlog.body).toEqual(processedBlogToView)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()
    await api.get(`/api/blogs/${validNonexistingId}`).expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'
    await api.get(`/api/blogs/${invalidId}`).expect(400)
  })
})

describe('addition of a new blog', () => {
  test('4.10 / 4.23 - a valid blog can be added', async () => {
    let newBlog = {
      title: 'TDD harms architecture',
      author: 'Robert C. Martin',
      url:
        'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
      likes: 0,
    }
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'josephalbaph', password: 'sekret' })

    await api
      .post('/api/blogs')
      .set('authorization', 'bearer ' + loginResponse.body.token)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map((n) => n.title)
    expect(titles).toContain('TDD harms architecture')
  })

  test('4.23 - adding a blog fails with the proper status code 401 Unauthorized if a token is not provided', async () => {
    let newBlog = {
      title: 'TDD harms architecture',
      author: 'Robert C. Martin',
      url:
        'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
      likes: 0,
    }

    await api.post('/api/blogs').send(newBlog).expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('4.11 / 4.23 - if the likes property is missing from the request, it will default to the value 0', async () => {
    let newBlog = {
      title: 'TDD harms architecture',
      author: 'Robert C. Martin',
      url:
        'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    }
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'josephalbaph', password: 'sekret' })

    const response = await api
      .post('/api/blogs')
      .set('authorization', 'bearer ' + loginResponse.body.token)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const savedBlog = response.body
    newBlog.id = savedBlog.id
    newBlog.likes = 0
    newBlog.user = savedBlog.user
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    expect(savedBlog.likes).toBe(0)
    const titles = blogsAtEnd.map((n) => n.title)
    expect(titles).toContain('TDD harms architecture')
  })

  test('4.12 / 4.23 - blog without title is not added, backend responds with 400', async () => {
    const newBlog = {
      author: 'Robert C. Martin',
      url:
        'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
      likes: 0,
    }
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'josephalbaph', password: 'sekret' })

    await api
      .post('/api/blogs')
      .set('authorization', 'bearer ' + loginResponse.body.token)
      .send(newBlog)
      .expect(400)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('4.12 / 4.23 - blog without author is not added, backend responds with 400', async () => {
    const newBlog = {
      title: 'TDD harms architecture',
      url:
        'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
      likes: 0,
    }
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'josephalbaph', password: 'sekret' })

    await api
      .post('/api/blogs')
      .set('authorization', 'bearer ' + loginResponse.body.token)
      .send(newBlog)
      .expect(400)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('deletion of a blog', () => {
  test('4.13 / 4.23 - a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'josephalbaph', password: 'sekret' })

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('authorization', 'bearer ' + loginResponse.body.token)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map((r) => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })

  test('4.21 - a blog cannot be deleted by another user', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'seconduser', password: 'sekret2' })

    const response = await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('authorization', 'bearer ' + loginResponse.body.token)
      .expect(401)

    expect(response.body.error).toContain('unauthorized deletion')
  })
})

describe('Updating a specific blog', () => {
  test('4.14 / 4.23 - a specific blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    let blogToUpdate = blogsAtStart[0]
    blogToUpdate.likes = 100
    blogToUpdate.title = 'Changed Title'
    blogToUpdate.author = 'Changed Author'
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'josephalbaph', password: 'sekret' })
    const resultBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('authorization', 'bearer ' + loginResponse.body.token)
      .send(blogToUpdate)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(resultBlog.body.id).toBe(blogToUpdate.id)
    expect(resultBlog.body.likes).toBe(100)
    expect(resultBlog.body.title).toBe('Changed Title')
    expect(resultBlog.body.author).toBe('Changed Author')

    const viewBlog = await api
      .get(`/api/blogs/${blogToUpdate.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    const processedBlogToView = JSON.parse(JSON.stringify(blogToUpdate))
    expect(viewBlog.body).toEqual(processedBlogToView)
  })
})


afterAll(() => {
  mongoose.connection.close()
})
