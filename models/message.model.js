import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const Message = mongoose.model(`Message`, messageSchema);
export default Message;