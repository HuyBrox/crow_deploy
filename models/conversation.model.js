import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    //nguời than gia
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: `User`,
        },
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: `Message`,
        },
    ],
    //tin nhắn chưa xem
    unreadMessages: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });
const Conversation = mongoose.model(`Conversation`, conversationSchema);
export default Conversation;