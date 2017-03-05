'use strict';

import mongoose  from 'mongoose';

var Schema = mongoose.Schema;

var Exam = new Schema({
    questions:[{
        text: String,
        options:[{
            key: String,
            value: String
        }],
        answer:{key: String, value: String}
    }],
    taken: Number
});

export default mongoose.model('Exam', Exam);