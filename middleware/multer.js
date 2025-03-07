import multer from 'multer';

// Cấu hình multer để lưu tệp vào bộ nhớ (RAM) và giới hạn dung lượng file tối đa là 50MB
const upload = multer({
    storage: multer.memoryStorage(),  // Lưu tệp vào bộ nhớ (RAM) thay vì ổ đĩa
    limits: { fileSize: 300 * 1024 * 1024 },  // Giới hạn dung lượng file tối đa là 300MB (50MB * 1024KB * 1024 byte)
    fileFilter: (req, file, cb) => {
        // Kiểm tra loại tệp (có thể thêm kiểm tra định dạng video, hình ảnh)
        const allowedTypes = /mp4|mov|avi|mkv|jpg|jpeg|png|gif/; // Ví dụ: video và hình ảnh
        const mimeType = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());

        if (mimeType && extname) {
            return cb(null, true); // Cho phép tải tệp lên nếu là tệp hợp lệ
        } else {
            cb(new Error('Chỉ chấp nhận video hoặc hình ảnh'), false); // Từ chối tệp không hợp lệ
        }
    }
});

export default upload;
