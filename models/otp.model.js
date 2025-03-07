import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: Date.now, // Thiết lập thời gian mặc định là thời điểm hiện tại
        index: { expires: '3m' } // Tự động xóa sau 3 phút
    },
}, { timestamps: true });

// Khai báo biến Otp
const Otp = mongoose.model('Otp', otpSchema);

// Export default
export default Otp;
