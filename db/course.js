const mongoose = require('mongoose');
const db = require('./db');

const Schema = mongoose.Schema;

const courseSchema = new Schema({
    courseName: String,
    instructorName: String,
    description: String,
    image: String,
    videoList: [{
        _id: false,
        fileName: String,
        videoName: String,
    }],
}, {
    versionKey: false,
});

const Course = db.model('Course', questionSchema);

module.exports = Course;
