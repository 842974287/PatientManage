const User = require('./user');

let admin = new User();
let normal = new User();

admin.username = 'wurui';
admin.password = '730220';
admin.realName = '吴锐';
admin.role = 1;

admin.save();
