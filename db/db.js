const mongoose = require('mongoose');

const db = mongoose.createConnection('mongodb://localhost:27017/Outpatient');

module.exports = db;
