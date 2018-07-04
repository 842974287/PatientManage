const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const db = require('./db');

const patientSchema = new Schema({
    name: String,
    gender: String,
    birthDate: Number,
    birthPlace: String,
    phoneNumber: String,
    firstAttackDate: Number,
    currentDiagnosis: [String],
    currentTreatments: [{
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
