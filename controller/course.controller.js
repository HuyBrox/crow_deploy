import mongoose from "mongoose";
import Lesson from "../models/lesson.model.js";
import Course from "../models/course.model.js";

// [GET] /course - Hiển thị danh sách khóa học
export const coursePage = async (req, res) => {
    try {
        const courses = await Course.find(); // Lấy tất cả khóa học
        console.log("📢 Courses from DB:", courses);
        res.render('./page/course/index', {
            title: 'Khóa học',
            courses: courses
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Không tìm thấy khóa học');
        res.redirect('back');
    }
};

// [GET] /course/:id - Hiển thị chi tiết khóa học
export const courseDetailPage = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId).populate("lessons");

        if (!course) {
            req.flash('error', 'Khóa học không tìm thấy');
            return res.redirect('/course');
        }

        // Lấy danh sách các khóa học liên quan
        const relatedCourses = await Course.find({
            _id: { $ne: courseId }, // Không lấy chính khóa học này
            language: course.language, // Lấy các khóa học có cùng ngôn ngữ
        }).limit(4); // Giới hạn số lượng

        console.log("📢 Course from DB:", course);


        res.render("./page/course/detail", {
            title: course.name,
            course: course,
            relatedCourses: relatedCourses
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Không tìm thấy khóa học');
        res.redirect('/course');
    }
};

// [GET] /course/:courseId/lesson/:lessonId - Hiển thị bài học cụ thể


export const lessonDetailPage = async (req, res) => {
    try {
        const { courseId, lessonId } = req.params;

        // Tìm khóa học có danh sách bài học
        const course = await Course.findById(courseId).populate("lessons");
        if (!course) {
            req.flash('error', 'Khóa học không tồn tại.');
            return res.redirect('/course');
        }

        // Tìm bài học theo ID
        const lesson = course.lessons.find(lesson => lesson._id.toString() === lessonId);
        if (!lesson) {
            req.flash('error', 'Bài học không tồn tại.');
            return res.redirect(`/course/${courseId}`);
        }
        console.log("📢 Lesson from DB:", lesson);
        res.render('page/course/lesson', {
            title: lesson.title,
            lesson: lesson,
            course: course
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Không tìm thấy bài học');
        res.redirect('back');
    }
};

export const createLessonTask = async (req, res) => {
    try {
        const { courseId, title, content, jsonTask } = req.body;
        const course = await Course.findById(courseId);
        if (!course) {
            res.status(404).json({ error: 'Không tìm thấy khóa học' });
        }
        const lesson = new Lesson({
            title,
            type: 'task',
            content,
            jsonTask,
        });
        await lesson.save();
        course.lessons.push(lesson);
        await course.save();
        return res.status(201).json({ message: 'Tạo khóa học thành công', lesson });


    } catch (error) {
        res.status(500).json({ error: 'Lỗi server' });
    }
};

export const createCourse = async (req, res) => {
    try {
        const { name, language, description, price } = req.body;
        const course = new Course({
            name,
            language,
            description,
            price,
        });
        await course.save();
        return res.status(201).json({ message: 'Tạo khóa học thành công' }, course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};