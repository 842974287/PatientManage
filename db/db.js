const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const db = mongoose.createConnection('mongodb://localhost:27017/Outpatient', {useNewUrlParser: true});

module.exports = db;
