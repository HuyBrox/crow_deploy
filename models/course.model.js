import e from 'connect-flash';
import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    //description: là mô tả của khóa học, có độ dài tối đa là 500 ký tự
    description: {
        type: String,
        max: 500,
    },
    //instructor là giảng viên của khóa học, tham chiếu đến model User
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    language: {
        type: String,
        required: true,
        enum: ['English', 'Vietnamese', 'Japanese', 'Chinese'],
    },
    //price là giá của khóa học, mặc định là 0
    price: {
        type: Number,
        default: 0,
    },
    //lessons là mảng chứa các bài học
    lessons: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
        },
    ]

}, { timestamps: true });

const Course = mongoose.model('Course', CourseSchema);
export default Course;
