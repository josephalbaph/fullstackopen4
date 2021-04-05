const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

// 4.17: Expand blogs so that each blog contains information on the creator of the blog.
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

// 4.19: new blogs is only possible if a valid token is sent with the HTTP POST request. 
//       The user identified by the token is designated as the creator of the blog.
blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const token = request.token
  const user = request.user
  if (!token || !user.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id,
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.json(savedBlog)
})

// 4.13 deleting a single blog post resource.
// 4.21 a blog can be deleted only by the user who added the blog
blogsRouter.delete('/:id', async (request, response) => {
  const token = request.token
  const user = request.user

  if (!token || !user.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const blog = await Blog.findById(request.params.id)
  if (blog.user.toString() === user.id.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  }
  return response.status(401).json({ error: 'unauthorized deletion' })
})

// 4.14 updating the information of an individual blog post.
blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const token = request.token
  const user = request.user

  if (!token || !user.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blogUpdate = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    blogUpdate,
    { new: true }
  )
  response.json(updatedBlog)
})

module.exports = blogsRouter
