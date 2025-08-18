const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const blogSchema = mongoose.Schema({
  title: {
    type: String,
    minLength: [3, 'Name too short'],
    maxLength: [100, 'Name too long'],
    required: [true, 'Name required'],
  },
  author: {
    type: String,
    minLength: [3, 'Author too short'],
    maxLength: [100, 'Author too long'],
    required: [true, 'Author required'],
  },
  url: {
    type: String,
    minLength: [3, 'Url too short'],
    maxLength: [100, 'Url too long'],
    required: [true, 'Url required'],
  },
  likes: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
})
blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject.likedBy
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Blog', blogSchema)
