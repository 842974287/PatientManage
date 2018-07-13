const mongoose = require('mongoose');
const db = require('./db');

const Schema = mongoose.Schema;

const recordSchema = new Schema({
    date: Number,
    patientID: Schema.Types.ObjectId,
    patientName: String,
    diagnosis: [String],
    briefTreatments: [String],
    treatments: [{
        _id: false,
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
