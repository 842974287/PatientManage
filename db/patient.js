const mongoose = require('mongoose');
const db = require('./db');

const Schema = mongoose.Schema;

const patientSchema = new Schema({
    name: String,
    personalID: String,
    gender: String,
    birthDate: Number,
    birthPlace: String,
    phoneNumber: String,
    firstAttackDate: Number,
    photos: [String],
    inqueue: { type: Boolean, default: false },
    urgent: { type: Boolean, default: false },
    favor: { type: Boolean, default: false },
    inqueueDate: Number,
    admitDate: Number,
    briefTreatments: [String],
    currentDiagnosis: [String],
    currentTreatments: [{
        _id: false,
        treatment: String,
        day: Number,
        time: Number,
        amount: Number,
    }],
    doctorName: String,
    userID: Schema.Types.ObjectId,
}, {
    versionKey: false,
});

const Patient = db.model('Patient', patientSchema);

module.exports = Patient;
