const mongoose = require('mongoose');


const userSchema = mongoose.Schema({ //유저모델
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, //문자열 공백 없애주는 역할
        unique: 1
    },
    password: {
        type: String,
        minlength : 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: { //user의 역할(관리자, 일반유저)
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

const User = mongoose.model('User',userSchema);

module.exports = {User};