const mongoose = require('mongoose');
const db = require('./db');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, unique: true },
    password: String,
    realName: String,
    role: Number, // excel: -1, admin: 1, inputer: 2
}, {
    versionKey: false,
});

const User = db.model('User', userSchema);

module.exports = User;
