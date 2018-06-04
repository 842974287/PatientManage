const fs = require('fs');

let diagnosis = JSON.parse(fs.readFileSync('./config/diagnosis.json'));
let treatment = JSON.parse(fs.readFileSync('./config/treatment.json'));
