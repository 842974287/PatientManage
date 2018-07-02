const router = require('koa-router')();
const mongoose = require('mongoose');
const configs = require('./lib/configs');
const opt = require('./lib/opt');

const Patient = require('./db/patient');
const Record = require('./db/record');

router.get('/', showMainPage)
    .get('/searchByName', searchByName)
    .get('/patientForm', showPatientForm)
    .post('/addNewPatient', addNewPatient)
    .get('/recordForm', showRecordForm)
    .post('/addNewRecord', addNewRecord)
    .get('/patientDetail', showPatientDetail);

async function showMainPage(ctx) {
    await ctx.render('main');
}

async function searchByName(ctx) {
    console.log(ctx.request);
    let patients = await Patient.find({name: ctx.query.name}).sort('birthDate');

    if (patients.length) {
        let patientList = opt.generatePatientList(patients);

        await ctx.render('patientList', {patients: patientList});
    }
    else {
        await ctx.redirect(encodeURI('/patientForm?name=' + ctx.query.name));
    }
}

async function showPatientForm(ctx) {
    await ctx.render('newPatientForm', {name: ctx.query.name });
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

    newRecord = new Record();
    newRecord.date = opt.normalizeDate();
    newRecord.patientID = patientID;
    newRecord.note = recordInfo.note;
    newRecord.diagnosis = recordInfo.diagnosis;
    patient.currentDiagnosis = recordInfo.diagnosis;

    if (recordInfo.hasOwnProperty('treatment')) {
        let treatments = [];
        for (let i = 0; i < recordInfo.treatment.length; i++) {
            let t = {};

            t.treatment = recordInfo.treatment[i];
            t.day = recordInfo.day[i];
            t.time = recordInfo.time[i];
            t.amount = recordInfo.amount[i];

            treatments.push(t);
        }
        newRecord.treatments = treatments;
        patient.currentTreatments = treatments;
    }

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
        records: records,
    });
}

module.exports = router;
