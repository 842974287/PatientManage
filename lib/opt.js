const Patient = require('../db/patient')

exports.generatePatientList = function (patients, flag = true) {
    let list = [];

    for (let i = 0; i < patients.length; i++) {
        list.push(this.generatePatient(patients[i], flag));
    }

    return list;
};

exports.generatePatient = function (rawPatient, flag) {
    let patientForDisplay = {};
    let patient = rawPatient.toObject();

    patientForDisplay._id = patient._id.toString();
    patientForDisplay.name = patient.name;
    patientForDisplay.personalID = patient.personalID;
    patientForDisplay.gender = patient.gender;
    patientForDisplay.birthDate = this.standardDate(patient.birthDate);

    if (flag) {
        patientForDisplay.firstAttackDate = this.standardDate(patient.firstAttackDate);
        patientForDisplay.diagnosis = patient.currentDiagnosis.toString();
        patientForDisplay.briefTreatments = patient.briefTreatments.toString();
        patientForDisplay.doctorName = patient.doctorName;
        patientForDisplay.birthPlace = patient.birthPlace;

        patientForDisplay.age = Math.floor((this.normalizeDate() - patient.birthDate) / 10000);
    }
    else {
        patientForDisplay.birthPlace = patient.birthPlace;
        patientForDisplay.inqueueDate = this.standardDate(patient.inqueueDate);
        patientForDisplay.inqueue = patient.inqueue ? 1 : 0;
        patientForDisplay.urgent = patient.urgent ? 1 : 0;
        patientForDisplay.favor = patient.favor ? 1 : 0;
    }

    return patientForDisplay;
};

exports.generatePatientDetail = function (rawPatient) {
    let patientForDisplay = {};
    let patient = rawPatient.toObject();

    patientForDisplay._id = patient._id.toString();
    patientForDisplay.name = patient.name;
    patientForDisplay.personalID = patient.personalID;
    patientForDisplay.gender = patient.gender;
    patientForDisplay.phoneNumber = patient.phoneNumber;
    patientForDisplay.birthDate = this.standardDate(patient.birthDate);
    patientForDisplay.birthPlace = patient.birthPlace;
    patientForDisplay.firstAttackDate = this.standardDate(patient.firstAttackDate);
    patientForDisplay.diagnosis = patient.currentDiagnosis.toString();
    patientForDisplay.briefTreatments = patient.briefTreatments.toString();
    patientForDisplay.photos = patient.photos;
    patientForDisplay.doctorName = patient.doctorName;
    patientForDisplay.inqueue = patient.inqueue;

    if (patient.hasOwnProperty('currentTreatments') && patient.currentTreatments.length > 0) {
        patientForDisplay.treatments = patient.currentTreatments;
    }

    patientForDisplay.age = Math.floor((this.normalizeDate() - patient.birthDate) / 10000);

    return patientForDisplay;
}

exports.generateRecordList = async function (records) {
    let list = [];

    for (let i = 0; i < records.length; i++) {
        list.push(await this.generateRecord(records[i]));
    }

    return list;
};

exports.generateRecord = async function (rawRecord) {
    let recordForDisplay = {};
    let record = rawRecord.toObject();
    let patient = await Patient.findById(record.patientID);
    patient = patient.toObject();

    recordForDisplay._id = record._id.toString();
    recordForDisplay.date = this.standardDate(record.date);
    recordForDisplay.patientID = record.patientID.toString();
    recordForDisplay.patientName = record.patientName;
    recordForDisplay.gender = patient.gender;
    recordForDisplay.age = Math.floor((this.normalizeDate() - patient.birthDate) / 10000);
    recordForDisplay.diagnosis = record.diagnosis.toString();
    recordForDisplay.briefTreatments = record.briefTreatments.toString();
    recordForDisplay.doctorName = record.doctorName;

    if (record.hasOwnProperty('treatments') && record.treatments.length > 0) {
        recordForDisplay.treatments = record.treatments;
    }

    if (record.note != '') {
        recordForDisplay.note = record.note;
    }

    return recordForDisplay;
}

exports.generateCourseList = function (courses) {
    let list = [];

    for (let i = 0; i < courses.length; i++) {
        list.push(this.generateCourse(courses[i]));
    }

    return list;
};

exports.generateCourse = function (rawCourse) {
    let courseForDisplay = {};
    let course = rawCourse.toObject();

    courseForDisplay._id = course._id.toString();
    courseForDisplay.courseName = course.courseName;
    courseForDisplay.instructorName = course.instructorName;
    courseForDisplay.description = course.description;
    courseForDisplay.image = course.image;

    return courseForDisplay;
};

exports.generateQuestionList = (questions) => {
    let list = [];

    for (let i = 0; i < questions.length; i++) {
        list.push(this.generateQuestion(questions[i]));
    }

    return list
}

exports.generateQuestion = (rawQuestion) => {
    let questionForDisplay = {};
    let question = rawQuestion.toObject();

    questionForDisplay._id = question._id;
    questionForDisplay.content = question.content;
    questionForDisplay.choices = question.choices;
    questionForDisplay.answer = question.answer;
    questionForDisplay.explanation = question.explanation;

    return questionForDisplay;
}

exports.normalizeDate = function () {
    let date = new Date();
    let now = 10000 * date.getUTCFullYear() + 100 * date.getUTCMonth() + date.getDate() + 100;

    return now;
};

exports.standardDate = function (number) {
    let str = number.toString();
    let standardDate = str.substring(0, 4) + '年';

    if (number % 100) {
        standardDate += str.substring(4, 6) + '月' + str.substring(6) + '日';
    }
    else if (number % 10000) {
        standardDate += str.substring(4, 6) + '月';
    }

    return standardDate;
}
