const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
  response.json(notes)
})

notesRouter.get('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

notesRouter.post('/', async (request, response, next) => {
  const body = request.body

  const user = await User.findById(request.user.id)

  const note = new Note({
    author: body.author,
    title: body.title,
    url: body.url,
    votes: body.votes || 0,
    important: body.important || false,
    user: user._id
  })

  // const note = new Note({
  //   content: body.content,
  //   important: body.important || false,
  // })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()

  response.status(201).json(savedNote)
})

notesRouter.delete('/:id', async (request, response) => {
  const user = request.user
  const note = await Note.findById(request.params.id)

  if (!note) {
    return response.status(404).json({ error: 'note not found' })
  }
  
  if (note.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'only the creator can delete this note' })
  }

  await Note.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

notesRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const note = {
    author: body.author,
    title: body.title,
    url: body.url,
    votes: body.votes,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

module.exports = notesRouter