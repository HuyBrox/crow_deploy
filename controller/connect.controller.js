import mongoose from "mongoose";
import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReciverSocketIds, io } from "../socket/socket.js";

export const callPage = async (req, res) => {
    try {
        const user = res.locals.user;
        const receiverId = req.query.receiverId;
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            req.flash('error', 'Người dùng không tồn tại');
            return res.redirect('/');
        }
        const receiverSocketIds = getReciverSocketIds(receiverId);
        if (!receiverSocketIds) {
            req.flash('error', 'Người dùng không online');
            return res.redirect('/');
        }
        res.render('./page/call/call', {
            title: 'Đang gọi cho ' + receiver.username,
            user,
            receiver
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Lỗi khi thiết lập cuộc gọi');
        return res.redirect('/');
    }
};

export const chatPage = async (req, res) => {
    try {
        const user = res.locals.user;
        const receiverId = req.query.receiverId;
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            req.flash('error', 'Người dùng không tồn tại');
            return res.redirect('/');
        }
        const conversation = await Conversation.findOne({
            members: { $all: [user._id, receiverId] }
        }).populate('messages');
        if (!conversation) {
            conversation = await Conversation.create({
                members: [user._id, receiverId]
            });
        }
        //thử thêm data vào conversation để xem
        await conversation.populate('messages');
        console.log(conversation);
        await conversation.save();
        res.render('./page/chat/chat', {
            title: 'Chat với ' + receiver.username,
            receiver,
            conversation
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Lỗi khi thiết lập cuộc trò chuyện');
        return res.redirect('/');
    }
}
//[POST] /chat/send
export const sendMessage = async (req, res) => {
    try {
        const user = res.locals.user;
        const { receiverId, message } = req.body;
        const receiver = await User.findById(receiverId);
        console.log("có tin nhắn mới từ", user._id, "đến", receiverId, ":", message);
        if (!receiver) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }
        getReciverSocketIds(receiver._id).forEach(socketId => {
            io.to(socketId).emit('newMessage', {
                senderId: user._id,
                message: message,
                timestamp: new Date()
            });
        });
        let conversation = await Conversation.findOne({
            members: { $all: [user._id, receiverId] }
        });
        conversation.messages.push(await Message.create({
            receiverId,
            senderId: user._id,
            message,
        }));
        conversation.unreadMessages++;
        await conversation.save();
        res.status(200).json({ message: 'Gửi tin nhắn thành công' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Lỗi khi gửi tin nhắn' });
    }
}

