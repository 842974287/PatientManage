const router = require('koa-router')();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const configs = require('./lib/configs');
const opt = require('./lib/opt');

const User = require('./db/user');
const Patient = require('./db/patient');
const Record = require('./db/record');
const Course = require('./db/course');

router.get('/', showLoginPage)
    .get('/main', showMainPage)
    .get('/allPatient', showAllPatient)
    .get('/allRecord', showAllRecord)
    .get('/inqueueList', showInqueueList)
    .get('/courseList', showCourseList)
    .get('/userForm', showNewUserForm)
    .get('/searchByName', searchByName)
    .get('/patientForm', showPatientForm)
    .get('/recordForm', showRecordForm)
    .get('/patientDetail', showPatientDetail)
    .get('/modifyPatient', showModifyPatientForm)
    .get('/modifyRecord', showModifyRecordForm)
    .get('/deletePatient', deletePatient)
    .get('/deleteRecord', deleteRecord)
    .get('/courseDetail', showCourseDetail)
    .get('/playVideo', playVideo)
    .get('/addCourse', addCourse)
    .post('/login', login)
    .post('/addNewPatient', addNewPatient)
    .post('/addNewRecord', addNewRecord)
    .post('/addNewUser', addNewUser)
    .post('/uploadFile', uploadFile)
    .post('/modifyPatient', modifyPatient)
    .post('/modifyRecord', modifyRecord)
    .post('/admit', admit);

async function showLoginPage(ctx) {
    await ctx.render('login');
}

async function login(ctx) {
    userInfo = ctx.request.body;
    user = await User.findOne({ 'username': userInfo.username });

    if (user) {
        if (user.password === userInfo.password) {
            ctx.session.userRole = user.role;
            ctx.session.userID = user._id;
            ctx.session.doctorName = user.realName;
            ctx.cookies.set(
                'role',
                user.role,
                {
                    httpOnly: false,  // 是否只用于http请求中获取
                    overwrite: false  // 是否允许重写
                }
            )

            ctx.body = { 'msg': 'success' };
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

    await ctx.render('main', { userRole: ctx.session.userRole });
}

async function showAllPatient(ctx) {
    if (!ctx.session.userRole) {
        await ctx.redirect('/');
    }
    else if (ctx.session.userRole == 2) {
        let patients = await Patient.find({ userID: ctx.session.userID });

        await ctx.render('allPatient', {
            patients: opt.generatePatientList(patients),
            userRole: ctx.session.userRole,
        });
    }
    else {
        let patients = await Patient.find();

        await ctx.render('allPatient', {
            patients: opt.generatePatientList(patients),
            userRole: ctx.session.userRole,
        });
    }
}

async function showAllRecord(ctx) {
    if (!ctx.session.userRole) {
        await ctx.redirect('/');
    }
    else if (ctx.session.userRole == 2) {
        let records = await Record.find({ userID: ctx.session.userID });

        await ctx.render('allRecord', {
            records: await opt.generateRecordList(records),
            userRole: ctx.session.userRole,
        });
    }
    else {
        let records = await Record.find();

        await ctx.render('allRecord', {
            records: await opt.generateRecordList(records),
            userRole: ctx.session.userRole,
        });
    }
}

async function showInqueueList(ctx) {
    if (!ctx.session.userRole) {
        await ctx.redirect('/');
    }

    let patients = await Patient.find({ inqueue: true });

    await ctx.render('inqueueList', {
        patients: opt.generatePatientList(patients, false),
    });
}

async function showNewUserForm(ctx) {
    if (!ctx.session.userRole) {
        await ctx.redirect('/');
    }
    else if (ctx.session.userRole > 1) {
        await ctx.redirect('/main');
    }

    await ctx.render('newUserForm', { userRole: ctx.session.userRole });
}

async function showCourseList(ctx) {
    if (!ctx.session.userRole) {
        await ctx.redirect('/');
    }
    else {
        let courses = await Course.find();

        await ctx.render('courseList', {
            courses: opt.generateCourseList(courses),
            userRole: ctx.session.userRole,
        });
    }
}

async function addNewUser(ctx) {
    userInfo = ctx.request.body;

    user = await User.findOne({ 'username': userInfo.username });

    if (!user) {
        newUser = new User();
        newUser.username = userInfo.username;
        newUser.password = userInfo.password;
        newUser.realName = userInfo.realName;
        newUser.role = userInfo.userRole;
        await newUser.save();

        ctx.redirect('/main');
    }
    else {
        await ctx.render()
    }
}

async function searchByName(ctx) {
    if (!ctx.session.userRole) {
        ctx.redirect('/');
    }

    let patients = await Patient.find({ name: ctx.query.name }).sort('birthDate');

    if (patients.length) {
        await ctx.render('patientList', {
            patients: opt.generatePatientList(patients),
            userRole: ctx.session.userRole,
        });
    }
    else {
        await ctx.redirect(encodeURI('/patientForm?name=' + ctx.query.name));
    }
}

async function showPatientForm(ctx) {
    if (!ctx.session.userRole) {
        ctx.redirect('/');
    }

    await ctx.render('newPatientForm', {
        name: ctx.query.name,
        userRole: ctx.session.userRole,
    });
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
    newPatient.doctorName = ctx.session.doctorName;
    newPatient.userID = ctx.session.userID;

    if (patientInfo.inqueue) {
        newPatient.inqueue = true;
        newPatient.inqueueDate = opt.normalizeDate();

        if (patientInfo.urgent) {
            newPatient.urgent = true;
        }
    }

    if (patientInfo.favor) {
        newPatient.favor = true;
    }

    await newPatient.save();

    await ctx.redirect(encodeURI('/recordForm?_id=' + newPatient._id.toString() + '&name=' + newPatient.name));
}

async function showRecordForm(ctx) {
    if (!ctx.session.userRole) {
        ctx.redirect('/');
    }

    await ctx.render('newRecordForm', {
        name: ctx.query.name,
        id: ctx.query._id,
        diagnosis: configs.readDiagnosis(),
        treatment: configs.readTreatment(),
        userRole: ctx.session.userRole,
    });
}

async function addNewRecord(ctx) {
    if (!ctx.session.userRole) {
        ctx.redirect('/');
    }

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
    newRecord.doctorName = ctx.session.doctorName;
    newRecord.userID = ctx.session.userID;

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
    patient.doctorName = newRecord.doctorName;
    patient.userID = newRecord.userID;

    await newRecord.save();
    await patient.save();

    await ctx.redirect('/main');
}

async function uploadFile(ctx) {
    if (!ctx.session.userRole) {
        ctx.redirect('/');
    }

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
        patient: opt.generatePatientDetail(patient),
        records: opt.generateRecordList(records),
    });
}

async function showModifyPatientForm(ctx) {
    if (ctx.session.userRole == 2) {
        await ctx.redirect('/main');
    }

    let patientID = mongoose.Types.ObjectId(ctx.query._id);
    let patient = await Patient.findById(patientID);

    await ctx.render('modifyPatient', {
        id: patient._id.toString(),
        patient: patient,
        userRole: ctx.session.userRole,
    });
}

async function showModifyRecordForm(ctx) {
    if (ctx.session.userRole == 2) {
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
        userRole: ctx.session.userRole,
    });
}

async function modifyPatient(ctx) {
    if (ctx.session.userRole == 2) {
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

    if (patientInfo.inqueue) {
        if (!patient.inqueue) {
            patient.inqueue = true;
            patient.inqueueDate = opt.normalizeDate();
        }

        if (patientInfo.urgent) {
            patient.urgent = true;
        }
    }
    else {
        patient.inqueue = false;
        patient.urgent = false;
    }

    if (patientInfo.favor) {
        patient.favor = true;
    }
    else {
        patient.favor = false;
    }

    await patient.save();

    await ctx.redirect('./patientDetail?_id=' + patientInfo.id);
}

async function modifyRecord(ctx) {
    if (ctx.session.userRole == 2) {
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
    if (ctx.session.userRole == 2) {
        await ctx.redirect('/main');
    }

    let patientID = mongoose.Types.ObjectId(ctx.query._id);
    let patientToDelete = await Patient.findByIdAndRemove(mongoose.Types.ObjectId(patientID));
    let recordsToDelete = await Record.deleteMany({ 'patientID': patientID });

    await ctx.redirect('/main');
}

async function deleteRecord(ctx) {
    if (ctx.session.userRole == 2) {
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
        patient.doctorName = record.doctorName;
        patient.userID = record.userID;
    }
    else {
        patient.currentDiagnosis = [];
        patient.currentTreatments = [];
        patient.briefTreatments = '';
    }

    await patient.save();

    await ctx.redirect('/patientDetail?_id=' + patient._id.toString());
}

async function showCourseDetail(ctx) {
    if (!ctx.session.userRole) {
        await ctx.redirect('/');
    }
    else {
        let courseID = mongoose.Types.ObjectId(ctx.query._id);
        let course = await Course.find({ _id: courseID });

        await ctx.render('courseDetail', {
            course: course[0],
            fileName: course[0].videoList[0].fileName,
        });
    }
}

async function addCourse(ctx) {

}

async function playVideo(ctx) {
    const fpath = 'video/sample.mp4';
    const fstat = fs.statSync(fpath)
    const fileSize = fstat.size;
    const range = ctx.req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const chunksize = (end - start) + 1
        const file = fs.createReadStream(fpath, {start, end})

        ctx.set('Content-Range', `bytes ${start}-${end}/${fileSize}`)
        ctx.set('Accept-Ranges', 'bytes')
        ctx.set('Content-Length', chunksize)
        ctx.set('Content-Type', 'video/mp4')

        ctx.status = 206;
        ctx.body = file
    }
    else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        }

        ctx.status = 200
        ctx.body = fs.createReadStream(fpath)
    }
}

async function admit(ctx) {
    if (!ctx.session.userRole) {
        ctx.redirect('/');
    }

    let patientID = mongoose.Types.ObjectId(ctx.request.body.patientID);
    let patient = await Patient.findById(patientID);

    patient.inqueue = false;
    patient.urgent = false;
    patient.admitDate = opt.normalizeDate();

    await patient.save();

    ctx.body = { 'msg': 'success' };
}

module.exports = router;
