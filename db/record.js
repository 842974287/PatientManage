const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const db = require('./db');

const recordSchema = new Schema({
    date: 
    diagnosis: [String],
    treatment: [String]
}, {
    versionKey: false
});

const Record = db.model('Record', recordSchema);

module.exports = Record;
