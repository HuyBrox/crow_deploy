import DataURIParser from 'datauri/parser.js';
import datauri from 'datauri/parser.js';
//import path để lấy đuôi file (thư viện có sẵn trong nodejs)
import path from 'path';
//datauri-parser được import từ thư viện datauri dùng để chuyển đổi file thành base64 để lưu vào database
const paser = new DataURIParser();
const getDatUri = (file) => {
    //lấy đuôi file
    const extName = path.extname(file.originalname).toString();
    //chuyển đổi file thành base64 với tham số đầu tiên là đuôi file, tham số thứ 2 là buffer của file
    return paser.format(extName, file.buffer).content;
}
export default getDatUri;