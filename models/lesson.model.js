import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['video', 'task'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    jsonTask: {
        type: mongoose.Schema.Types.Mixed, //JSON
        default: null,
    },
    videoUrl: {
        type: String,
        default: null,
    }
});


lessonSchema.pre('save', function (next) {
    if (this.type === 'task' && !this.jsonTask) {
        return next(new Error("jsonTask is required for task type"));
    }
    if (this.type === 'video' && !this.videoUrl) {
        return next(new Error("videoUrl is required for video type"));
    }
    next();
});

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;
