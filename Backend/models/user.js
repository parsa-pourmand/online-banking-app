const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    cardnum:{type: String, required: true, unique: true},
    password:{type: String, required: true},
    firstName:{type: String, required: true},
    lastName:{type: String, required: true},
    email:{type: String, required: true},
    phone:{type: String, required: true, unique: true},
    balance:{type: Number, default: 0 },
});

module.exports = mongoose.model('User', userSchema);