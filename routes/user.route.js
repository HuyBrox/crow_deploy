import express from 'express';

import {
    getLogin, postLogin, getRegister, postRegister, getLogout, getHome,
    getAbout,
    getListUser,
    getProfile
} from '../controller/user.controller.js';
import { auth, requireAuth } from '../middleware/auth.js';



const router = express.Router();


router.get('/login', getLogin);
router.post('/login', postLogin);
router.get('/register', getRegister);
router.post('/register', postRegister);
router.get('/logout', getLogout);
router.get('/', auth, getHome);
router.get('/profile', auth, getProfile);
router.get('/about', requireAuth, getAbout)
router.get('/getUsers', requireAuth, getListUser);
router.get('/profile', requireAuth, getProfile);
export default router;