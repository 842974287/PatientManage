const mongoose = require('mongoose');
const db = require('./db');

const Schema = mongoose.Schema;

const questionSchema = new Schema({
    type: Number, // 1: T or F, 2: multiple choices
    content: String,
    answer: String,
    explaination: String,
    relatedCourse: Schema.Types.ObjectId,
    relatedVideo: String,
}, {
    versionKey: false,
});

const Question = db.model('Question', questionSchema);

module.exports = Question;
