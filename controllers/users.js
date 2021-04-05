const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

// 4.15 Implement a way to create new users by doing a HTTP POST-request
//      to address api/users.
// 4.16 Both username and password must be given.
//      Both username and password must be at least 3 characters long.
//      The username must be unique.
usersRouter.post('/', async (request, response) => {
  const body = request.body
  if (body.username === undefined) {
    return response.status(400).json({ error: 'username missing' })
  }

  if (body.password === undefined) {
    return response.status(400).json({ error: 'password missing' })
  }

  if (body.username.length < 3) {
    return response.status(400).json({ error: 'username must have at least 3 characters' })
  }

  if (body.password.length < 3) {
    return response.status(400).json({ error: 'password must have at least 3 characters' })
  }

  const userExist = await User.findOne({ username: body.username })

  if (userExist) {
    return response.status(400).json({ error: 'username is already used' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.json(savedUser)
})

// 4.15 Implement a way to see the details of all users by doing a suitable HTTP request.
// 4.17  listing all users also displays the blogs created by each user:
usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs')
  response.json(users)
})

module.exports = usersRouter
