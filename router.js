const router = require('koa-router')();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const configs = require('./lib/configs');
const opt = require('./lib/opt');

const User = require('./db/user');
const Patient = require('./db/patient');
const Record = require('./db/record');

router.get('/', showLoginPage)
    .get('/main', showMainPage)
    .get('/allPatient', showAllPatient)
    .get('/allRecord', showAllRecord)
    .get('/searchByName', searchByName)
    .get('/patientForm', showPatientForm)
    .get('/recordForm', showRecordForm)
    .get('/patientDetail', showPatientDetail)
    .get('/modifyPatient', showModifyPatientForm)
    .get('/modifyRecord', showModifyRecordForm)
    .get('/deletePatient', deletePatient)
    .get('/deleteRecord', deleteRecord)
    .post('/login', login)
    .post('/addNewPatient', addNewPatient)
    .post('/addNewRecord', addNewRecord)
    .post('/uploadFile', uploadFile)
    .post('/modifyPatient', modifyPatient)
    .post('/modifyRecord', modifyRecord);

async function showLoginPage(ctx) {
    await ctx.render('login');
}

async function login(ctx) {
    userInfo = ctx.request.body;
    user = await User.findOne({ 'username': userInfo.username });

    if (user) {
        if (user.password === userInfo.password) {
            ctx.session.userRole = user.role;

            await ctx.redirect('/main');
        }
        else {
            ctx.body = { 'msg': '密码错误' };
        }
    }
    else {
        ctx.body = { 'msg': '用户不存在' };
    }
}

async function showMainPage(ctx) {
    if (!ctx.session.userRole) {
        await ctx.redirect('/');
    }

    await ctx.render('main');
}

async function showAllPatient(ctx) {
    if (!ctx.session.userRole) {
        await ctx.redirect('/');
    }
    else if (ctx.session.userRole != 1) {
        await ctx.redirect('/');
    }

    let patients = await Patient.find();
    await ctx.render('allPatient', { patients: opt.generatePatientList(patients) });
}

async function showAllRecord(ctx) {
    if (!ctx.session.userRole) {
        await ctx.redirect('/');
    }
    else if (ctx.session.userRole != 1) {
        await ctx.redirect('/');
    }

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
    if (!ctx.session.userRole) {
        await ctx.redirect('/');
    }

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
    newPatient.photo = [];
    await newPatient.save();

    await ctx.redirect(encodeURI('/recordForm?_id=' + newPatient._id.toString() + '&name=' + newPatient.name));
}

async function showRecordForm(ctx) {
    if (!ctx.session.userRole) {
        await ctx.redirect('/');
    }

    await ctx.render('newRecordForm', {
        name: ctx.query.name,
        id: ctx.query._id,
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

    await ctx.redirect('/main');
}

async function uploadFile(ctx) {
    const files = ctx.request.body.files.file;
    let patient = await Patient.findById(mongoose.Types.ObjectId(ctx.request.body.fields.patientID));

    if (!files.length) {
        if (files.size) {
            let filename = Date.now().toString() + path.extname(files.name);
            let reader = fs.createReadStream(files.path);
            let stream = fs.createWriteStream(path.join(process.cwd(), 'photo', filename));
            reader.pipe(stream);

            patient.photos.push(filename);
        }
    }
    else {
        for (let key in files) {
            let file = files[key];
            let filename = Date.now().toString() + path.extname(file.name);
            let reader = fs.createReadStream(file.path);
            let stream = fs.createWriteStream(path.join(process.cwd(), 'photo', filename));
            reader.pipe(stream);

            patient.photos.push(filename);
        }
    }

    await patient.save();
    await ctx.redirect(ctx.request.header.referer);
}

async function showPatientDetail(ctx) {
    if (!ctx.session.userRole) {
        await ctx.redirect('/');
    }

    let patientID = mongoose.Types.ObjectId(ctx.query._id);
    let patient = await Patient.findById(patientID);
    let records = await Record.find({ patientID: patientID }).sort('-date');

    await ctx.render('patientDetail', {
        userRole: ctx.session.userRole,
        patient: opt.generatePatient(patient),
        records: opt.generateRecordList(records),
    });
}

async function showModifyPatientForm(ctx) {
    if (ctx.session.userRole != 1) {
        await ctx.redirect('/main');
    }

    let patientID = mongoose.Types.ObjectId(ctx.query._id);
    let patient = await Patient.findById(patientID);

    await ctx.render('modifyPatient', {
        id: patient._id.toString(),
        patient: patient,
    });
}

async function showModifyRecordForm(ctx) {
    if (ctx.session.userRole != 1) {
        await ctx.redirect('/main');
    }

    let recordID = mongoose.Types.ObjectId(ctx.query._id);
    let record = await Record.findById(recordID);

    await ctx.render('modifyRecord', {
        patientID: record.patientID.toString(),
        recordID: record._id.toString(),
        record: record,
        diagnosis: configs.readDiagnosis(),
        treatment: configs.readTreatment(),
    });
}

async function modifyPatient(ctx) {
    if (ctx.session.userRole != 1) {
        await ctx.redirect('/main');
    }

    let patientInfo = ctx.request.body;
    let patientID = mongoose.Types.ObjectId(patientInfo.id);
    let patient = await Patient.findById(patientID);

    patient.name = patientInfo.name;
    patient.gender = patientInfo.gender;
    patient.birthDate = patientInfo.birthDate;
    patient.birthPlace = patientInfo.birthPlace;
    patient.phoneNumber = patientInfo.phoneNumber;
    patient.firstAttackDate = patientInfo.firstAttackDate;

    await patient.save();
    await ctx.redirect('./patientDetail?_id=' + patientInfo.id);
}

async function modifyRecord(ctx) {
    if (ctx.session.userRole != 1) {
        await ctx.redirect('/main');
    }

    recordInfo = ctx.request.body;
    let patientID = mongoose.Types.ObjectId(recordInfo.patientID);
    let patient = await Patient.findById(patientID);
    let record = await Record.findById(mongoose.Types.ObjectId(recordInfo.recordID))
    let lastRecord = await Record.findOne({ 'patientID': patientID }).sort('-date');
    let treatments = [];
    let briefTreatments = [];

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

    record.diagnosis = recordInfo.diagnosis;

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

    record.treatments = treatments;
    record.briefTreatments = briefTreatments;
    record.note = recordInfo.note;

    if (lastRecord._id.toString() == record._id.toString()) {
        patient.currentDiagnosis = recordInfo.diagnosis;
        patient.currentTreatments = treatments;
        patient.briefTreatments = briefTreatments;
    }

    await record.save();
    await patient.save();

    await ctx.redirect('./patientDetail?_id=' + recordInfo.patientID);
}

async function deletePatient(ctx) {
    if (ctx.session.userRole != 1) {
        await ctx.redirect('/main');
    }

    let patientID = mongoose.Types.ObjectId(ctx.query._id);
    let patientToDelete = await Patient.findByIdAndRemove(mongoose.Types.ObjectId(patientID));
    let recordsToDelete = await Record.deleteMany({ 'patientID': patientID });

    await ctx.redirect('/main');
}

async function deleteRecord(ctx) {
    if (ctx.session.userRole != 1) {
        await ctx.redirect('/main');
    }

    let recordID = mongoose.Types.ObjectId(ctx.query._id);
    let recordToDelete = await Record.findByIdAndRemove(recordID);

    let record = await Record.findOne({ 'patientID': recordToDelete.patientID }).sort('-date');
    let patient = await Patient.findById(recordToDelete.patientID);

    if (record) {
        patient.currentDiagnosis = record.diagnosis;
        patient.currentTreatments = record.treatments;
        patient.briefTreatments = record.briefTreatments;
    }
    else {
        patient.currentDiagnosis = [];
        patient.currentTreatments = [];
        patient.briefTreatments = '';
    }

    await patient.save();

    await ctx.redirect('/patientDetail?_id=' + patient._id.toString());
}

module.exports = router;
