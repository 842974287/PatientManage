exports.generatePatientList = function (patients) {
    let list = [];

    for (let i = 0; i < patients.length; i++) {
        list.push(this.generatePatient(patients[i]));
    }

    return list;
};

exports.generatePatient = function (rawPatient) {
    let patientForDisplay = {};
    let patient = rawPatient.toObject();

    patientForDisplay._id = patient._id.toString();
    patientForDisplay.name = patient.name;
    patientForDisplay.gender = patient.gender;
    patientForDisplay.birthPlace = patient.birthPlace;
    patientForDisplay.phoneNumber = patient.phoneNumber;
    patientForDisplay.birthDate = this.standardDate(patient.birthDate);
    patientForDisplay.firstAttackDate = this.standardDate(patient.firstAttackDate);
    patientForDisplay.diagnosis = patient.currentDiagnosis.toString();
    patientForDisplay.briefTreatments = patient.briefTreatments.toString();

    if (patient.hasOwnProperty('currentTreatments') && patient.currentTreatments.length > 0) {
        patientForDisplay.treatments = patient.currentTreatments;
    }

    let now = this.normalizeDate();
    patientForDisplay.age = Math.floor((now - patient.birthDate) / 10000);

    return patientForDisplay;
};

exports.generateRecordList = function (records) {
    let list = [];

    for (let i = 0; i < records.length; i++) {
        list.push(this.generateRecord(records[i]));
    }

    return list;
};

exports.generateRecord = function (rawRecord) {
    let recordForDisplay = {};
    let record = rawRecord.toObject();

    recordForDisplay.date = this.standardDate(record.date);
    recordForDisplay.patientID = record.patientID.toString();
    recordForDisplay.patientName = record.patientName;
    recordForDisplay.diagnosis = record.diagnosis.toString();
    recordForDisplay.briefTreatments = record.briefTreatments.toString();

    if (record.hasOwnProperty('treatments') && record.treatments.length > 0) {
        recordForDisplay.treatments = record.treatments;
    }

    if (record.note != '') {
        recordForDisplay.note = record.note;
    }

    return recordForDisplay;
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
