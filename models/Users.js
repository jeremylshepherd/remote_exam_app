'use strict';

import mongoose  from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

var Schema = mongoose.Schema;

var User = new Schema({
    firstName: String,
    lastName: String,
	local:{
        id: Number,
        email: String,
        username: String,
        password: String,
        created: Date,
        resetPasswordToken: String,
        resetExpires: Number
    },
    exams: [{ type: Schema.Types.ObjectId, ref: 'Exam' }]
});

User.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
User.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

export default mongoose.model('User', User);