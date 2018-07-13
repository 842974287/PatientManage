const User = require('./user');

let admin = new User();
let normal = new User();

admin.username = 'wurui';
admin.password = 'wurui12345';
admin.role = 1;

normal.username = 'dsy';
normal.password = 'dsy12345';
normal.role = 2;

admin.save();
normal.save();
