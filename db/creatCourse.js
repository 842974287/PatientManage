const Course = require('./course');

let course = new Course();

course.courseName = '风湿病';
course.instructorName = '吴锐';
course.description = '讲述风湿病的基本知识。';
course.videoList = [{
    fileName: 'test.mp4',
    videoName: '风湿病基础',
}];

course.save();
