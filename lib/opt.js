exports.generatePatientList = function (patients) {
    let list = [];

    for (let i = 0; i < patients.length; i++) {
        list.push(this.generatePatient(patients[i]));
    }

    return list;
};

exports.generatePatient = function (patient) {
    let patientForDisplay = {};

    patientForDisplay._id = patient._id.toString();
    patientForDisplay.name = patient.name;
    patientForDisplay.gender = patient.gender;
    patientForDisplay.birthPlace = patient.birthPlace;
    patientForDisplay.phoneNumber = patient.phoneNumber;
    patientForDisplay.birthDate = this.standardDate(patient.birthDate);
    patientForDisplay.firstAttackDate = this.standardDate(patient.firstAttackDate);
    patientForDisplay.diagnosis = patient.currentDiagnosis.toString();

    if (patient.hasOwnProperty('currentTreatment')) {
        patientForDisplay.treatments = patient.currentTreatments;
    }

    let now = this.normalizeDate();
    patientForDisplay.age = Math.floor((now - patient.birthDate) / 10000);

    return patientForDisplay;
};

exports.normalizeDate = function () {
    let date = new Date();
    let now = 10000 * date.getUTCFullYear() + 100 * date.getUTCMonth() + date.getUTCDay() + 101;

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
