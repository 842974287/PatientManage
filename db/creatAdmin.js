const User = require('./user');

let admin = new User();

admin.username = 'qwe';
admin.password = '12345';
admin.realName = 'asdf';
admin.role = -1;

admin.save();
