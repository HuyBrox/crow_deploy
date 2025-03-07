import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.clearCookie('token');
            res.locals.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded._id);
        if (!user) {
            req.flash('error', 'Lỗi xác thực người dùng.');
            res.clearCookie('token');
            res.locals.user = null;
            return next();
        }


        res.locals.user = user;
        next();
    } catch (error) {
        res.clearCookie('token');
        res.locals.user = null;
        next();
        console.error('Error during authentication:', error);
    }
};

export const requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            req.flash('error', 'Vui lòng đăng nhập để tiếp tục!');
            return res.redirect('/');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded._id);

        if (!user) {
            req.flash('error', 'Xác thực không hợp lệ, vui lòng đăng nhập lại.');
            res.clearCookie('token');
            return res.redirect('/');
        }

        req.user = user;  // Gán user vào request
        res.locals.user = user;
        console.log("user request:", user.username);
        next();
        // sua
        // if (!req.session.user) {
        //     // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
        //     return res.redirect('/login'); 
        // }
        // next();

    } catch (error) {
        res.clearCookie('token');
        req.flash('error', 'Xác thực không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại.');
        return res.redirect('/login');
    }
}