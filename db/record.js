const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const db = require('./db');

const recordSchema = new Schema({
    date: Number,
    patientID: Schema.Types.ObjectId,
    diagnosis: [String],
    treatments: [{
        treatment: String,
        day: Number,
        time: Number,
        amount: Number,
    }],
    note: String,
}, {
    versionKey: false,
});

const Record = db.model('Record', recordSchema);

module.exports = Record;
