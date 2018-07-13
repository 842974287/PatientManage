const mongoose = require('mongoose');
const db = require('./db');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, unique: true },
    password: String,
    role: Number, // admin: 1, normail: 2
}, {
    versionKey: false,
});

const User = db.model('User', userSchema);

module.exports = User;
