const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: false
    },
    message: {
        type: String,
        required: true
    }
})

const User = mongoose.model('User', UserSchema)
module.exports = User