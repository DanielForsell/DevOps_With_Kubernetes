const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
    minlength: 5
  },
  title: {
    type: String,
    required: true,
    minlength: 5
  },
  url: {
    type: String,
    required: true,
    minlength: 5
  },
  votes: Number ,
  important: Boolean,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

// const noteSchema = new mongoose.Schema({
//   content: {
//     type: String,
//     required: true,
//     minlength: 5
//   },
//   important: Boolean,
// })

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Note', noteSchema)