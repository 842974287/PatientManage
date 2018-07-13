const mongoose = require('mongoose');
const db = require('./db');

const Schema = mongoose.Schema;

const patientSchema = new Schema({
    name: String,
    gender: String,
    birthDate: Number,
    birthPlace: String,
    phoneNumber: String,
    firstAttackDate: Number,
    photos: [String],
    briefTreatments: [String],
    currentDiagnosis: [String],
    currentTreatments: [{
        _id: false,
        treatment: String,
        day: Number,
        time: Number,
        amount: Number,
    }],
}, {
    versionKey: false,
});

const Patient = db.model('Patient', patientSchema);

module.exports = Patient;
