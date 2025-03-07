import express from 'express';
import { coursePage, courseDetailPage, lessonDetailPage, createLessonTask, createCourse } from '../controller/course.controller.js';
import { auth, requireAuth } from '../middleware/auth.js';

const router = express.Router();


router.get('/course', requireAuth, coursePage);
router.get('/course/detail/:id', requireAuth, courseDetailPage);
router.get('/course/:courseId/lesson/:lessonId', requireAuth, lessonDetailPage);
router.post('/course/createLessonTask', createLessonTask);
router.post('/course/createCourse', createCourse);
export default router;