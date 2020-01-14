const mongoose = require('mongoose');
const db = require('./db');

const Schema = mongoose.Schema;

const questionSchema = new Schema({
    content: String,
    choices: [String],
    answer: String,
    explanation: { type: String, default: 'No explanation for now.' },
    relatedCourse: Schema.Types.ObjectId,
    relatedVideo: Number,
}, {
    versionKey: false,
});

const Question = db.model('Question', questionSchema);

module.exports = Question;
