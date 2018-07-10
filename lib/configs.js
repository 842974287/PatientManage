const fs = require('fs');
const DIAGNOSIS_FILE = './lib/jsonFiles/diagnosis.json';
const TREATMENT_FILE = './lib/jsonFiles/treatment.json';

let diagnosis = JSON.parse(fs.readFileSync(DIAGNOSIS_FILE)).diagnosis;
let treatment = JSON.parse(fs.readFileSync(TREATMENT_FILE)).treatment;

exports.readDiagnosis = function () {
    return diagnosis
};

exports.readTreatment = function () {
    return treatment;
};

exports.addDiagnosis = function (newDiagnosis) {
    if (typeof newDiagnosis == 'string') {
        newDiagnosis = newDiagnosis.split(' ');
    }

    diagnosis = diagnosis.concat(newDiagnosis);
    fs.writeFileSync(DIAGNOSIS_FILE, JSON.stringify({ 'diagnosis': diagnosis }));
};

exports.addTreatment = function (newTreatment) {
    if (typeof newTreatment == 'string') {
        newTreatment = newTreatment.split(' ');
    }

    treatment = treatment.concat(newTreatment);
    fs.writeFileSync(TREATMENT_FILE, JSON.stringify({ 'treatment': treatment }));
};
