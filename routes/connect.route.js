import express from 'express';
import { callPage, chatPage, sendMessage } from '../controller/connect.controller.js';
import { auth, requireAuth } from '../middleware/auth.js';

const router = express.Router();


router.get('/call', requireAuth, callPage);
router.get('/chat', requireAuth, chatPage);
router.post('/chat', requireAuth, sendMessage);
export default router;