const Note = require('../models/note')
const User = require('../models/user')

const initialNotes = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    votes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    votes: 5,
  }
]

const nonExistingId = async () => {
  const note = new Note({ 
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    votes: 7
  })
  await note.save()
  await note.deleteOne()

  return note._id.toString()
}

const notesInDb = async () => {
  const notes = await Note.find({})
  return notes.map(note => note.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialNotes, nonExistingId, notesInDb, usersInDb
}