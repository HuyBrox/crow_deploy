import express from 'express';
import { coursePage, courseDetailPage, lessonDetailPage, createCourse, addLessonVideo, deleteLesson, deleteCourse, createLessonTask, saveLessonNote } from '../controller/course.controller.js';
import { auth, requireAuth } from '../middleware/auth.js';
// import upload from '../middleware/multer.js';
import multer from 'multer';


const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();


router.get('/course', requireAuth, coursePage);
router.get('/course/detail/:id', requireAuth, courseDetailPage);
router.get('/course/:courseId/lesson/:lessonId', requireAuth, lessonDetailPage);
router.post('/course/create', upload.single('thumbnail'), createCourse);
router.post('/course/addLessonVideo', upload.single('videoUrl'), addLessonVideo);
// Sửa tuyến xóa khóa học từ POST -> DELETE
router.delete('/course/detail/:courseId', deleteCourse);
// Thêm tuyến xóa bài học
router.delete('/course/:courseId/lesson/:lessonId', deleteLesson);
router.post('/course/createLessonTask', createLessonTask);
router.post('/course/:courseId/lesson/:lessonId/note', requireAuth, saveLessonNote);
export default router;