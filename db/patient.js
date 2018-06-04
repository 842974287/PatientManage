const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const db = require('./db');

const patientSchema = new Schema({
    name: String,
    gender: String,
    birthDate: String,
    diagnosis: [String],
    treatment: [String]
}, {
    versionKey: false
});

const Patient = db.model('Patient', patientSchema);

module.exports = Patient;
