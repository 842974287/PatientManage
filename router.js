const router = require('koa-router')();
const mongoose = require('mongoose');
const configs = require('./lib/configs');
const opt = require('./lib/opt');

const Patient = require('./db/patient');
const Record = require('./db/record');

router.get('/', showMainPage)
    .get('/allPatient', showAllPatient)
    .get('/allRecord', showAllRecord)
    .get('/searchByName', searchByName)
    .get('/patientForm', showPatientForm)
    .post('/addNewPatient', addNewPatient)
    .get('/recordForm', showRecordForm)
    .post('/addNewRecord', addNewRecord)
    .get('/patientDetail', showPatientDetail);

async function showMainPage(ctx) {
    await ctx.render('main');
}

async function showAllPatient(ctx) {
    let patients = await Patient.find();

    await ctx.render('allPatient', { patients: opt.generatePatientList(patients) });
}

async function showAllRecord(ctx) {
    let records = await Record.find();

    await ctx.render('allRecord', { records: opt.generateRecordList(records) });
}

async function searchByName(ctx) {
    let patients = await Patient.find({ name: ctx.query.name }).sort('birthDate');

    if (patients.length) {
        await ctx.render('patientList', { patients: opt.generatePatientList(patients) });
    }
    else {
        await ctx.redirect(encodeURI('/patientForm?name=' + ctx.query.name));
    }
}

async function showPatientForm(ctx) {
    await ctx.render('newPatientForm', { name: ctx.query.name });
}

async function addNewPatient(ctx) {
    patientInfo = ctx.request.body;

    newPatient = new Patient();
    newPatient.name = patientInfo.name;
    newPatient.gender = patientInfo.gender;
    newPatient.birthDate = patientInfo.birthDate;
    newPatient.birthPlace = patientInfo.birthPlace;
    newPatient.phoneNumber = patientInfo.phoneNumber;
    newPatient.firstAttackDate = patientInfo.firstAttackDate;
    await newPatient.save();

    await ctx.redirect(encodeURI('/recordForm?id=' + newPatient._id.toString() + '&name=' + newPatient.name));
}

async function showRecordForm(ctx) {
    await ctx.render('newRecordForm', {
        name: ctx.query.name,
        id: ctx.query.id,
        diagnosis: configs.readDiagnosis(),
        treatment: configs.readTreatment(),
    });
}

async function addNewRecord(ctx) {
    recordInfo = ctx.request.body;
    let patientID = mongoose.Types.ObjectId(recordInfo.id);
    let patient = await Patient.findById(patientID);
    let treatments = [];
    let briefTreatments = [];

    newRecord = new Record();
    newRecord.date = opt.normalizeDate();
    newRecord.patientID = patientID;
    newRecord.patientName = patient.name;
    newRecord.note = recordInfo.note;

    if (recordInfo.hasOwnProperty('newDiagnosis')) {
        if (typeof recordInfo.newDiagnosis == 'string') {
            recordInfo.newDiagnosis = recordInfo.newDiagnosis.split(' ');
        }

        configs.addDiagnosis(recordInfo.newDiagnosis);

        if (recordInfo.hasOwnProperty('diagnosis')) {
            if (typeof recordInfo.diagnosis == 'string') {
                recordInfo.diagnosis = recordInfo.diagnosis.split(' ');
            }

            recordInfo.diagnosis = recordInfo.diagnosis.concat(recordInfo.newDiagnosis);
        }
        else {
            recordInfo.diagnosis = recordInfo.newDiagnosis;
        }
    }

    newRecord.diagnosis = recordInfo.diagnosis;
    patient.currentDiagnosis = recordInfo.diagnosis;

    if (recordInfo.hasOwnProperty('newTreatments')) {
        if (typeof recordInfo.newTreatments == 'string') {
            recordInfo.newTreatments = recordInfo.newTreatments.split(' ');
        }

        configs.addTreatment(recordInfo.newTreatments);
        briefTreatments = briefTreatments.concat(recordInfo.newTreatments);

        for (let i = 0; i < recordInfo.newTreatments.length; i++) {
            let t = {};

            t.treatment = recordInfo.newTreatments[i];
            t.day = recordInfo.newDay[i];
            t.time = recordInfo.newTime[i];
            t.amount = recordInfo.newAmount[i];

            treatments.push(t);
        }
    }

    if (recordInfo.hasOwnProperty('treatments')) {
        if (typeof recordInfo.treatments == 'string') {
            recordInfo.treatments = recordInfo.treatments.split(' ');
        }

        briefTreatments = briefTreatments.concat(recordInfo.treatments);

        for (let i = 0; i < recordInfo.treatments.length; i++) {
            let t = {};

            t.treatment = recordInfo.treatments[i];
            t.day = recordInfo.day[i];
            t.time = recordInfo.time[i];
            t.amount = recordInfo.amount[i];

            treatments.push(t);
        }
    }

    newRecord.treatments = treatments;
    newRecord.briefTreatments = briefTreatments;
    patient.currentTreatments = treatments;
    patient.briefTreatments = briefTreatments;

    await newRecord.save();
    await patient.save();

    await ctx.redirect('/');
}

async function showPatientDetail(ctx) {
    let patientID = mongoose.Types.ObjectId(ctx.query._id)
    let patient = await Patient.findById(patientID);
    let records = await Record.find({patientID: patientID}).sort('-date');

    await ctx.render('patientDetail', {
        patient: opt.generatePatient(patient),
        records: opt.generateRecordList(records),
    });
}

module.exports = router;
