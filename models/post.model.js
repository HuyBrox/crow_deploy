import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        max: 500,
        default: "",
    },
    img: {
        type: String,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true,
    },
    desc: {
        type: String,
        max: 500,
    },

    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: `User`,
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: `Comment`,
        }
    ],

}, { timestamps: true });
const Post = mongoose.model(`Post`, postSchema);
export default Post;
