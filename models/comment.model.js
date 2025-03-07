import { text } from "express";
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: `User`,
        }
    ],
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `Post`,
        required: true,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment', default: null
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    score: {
        type: Number,
        default: 0
    },
    depth: {
        type: Number,
        default: 0
    }


}, { timestamps: true });
const Comment = mongoose.model(`Comment`, commentSchema);

export default Comment;