// Lấy thông tin từ data attributes (được render từ server)
const chatContainer = document.querySelector('.chat-container');
const currentUserId = chatContainer.getAttribute('data-current-user-id');
const receiverId = chatContainer.getAttribute('data-receiver-id');
const receiverAvatar = chatContainer.getAttribute('data-receiver-avatar') || 'avatar.jpg';

const chatBox = document.querySelector('.chat-box');
const chatInput = document.querySelector('.chat-text-input');
const sendButton = document.querySelector('.send-button');
const userId = document.querySelector('.userId')?.value;

const socket = io('http://localhost:5000', { query: { userId } });
socket.on('connect', () => {
    console.log('Đã kết nối tới server');
});
socket.on('connect_error', (err) => {
    console.error('Không thể kết nối tới server:', err);
});
// Hàm thêm tin nhắn vào giao diện
function appendMessage({ senderId, message, timestamp }) {
    const messageDiv = document.createElement('div');
    // Kiểm tra tin nhắn gửi từ người dùng hay từ bạn
    if (senderId === userId) {
        messageDiv.className = 'chat-message right';
    } else {
        messageDiv.className = 'chat-message left';
        const avatar = document.createElement('img');
        avatar.src = receiverAvatar;
        avatar.alt = 'Avatar';
        messageDiv.appendChild(avatar);
    }
    const textDiv = document.createElement('div');
    textDiv.className = 'chat-text';
    textDiv.textContent = message;
    messageDiv.appendChild(textDiv);
    chatBox.appendChild(messageDiv);
    // Cuộn chatBox xuống dưới cùng
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Gửi tin nhắn khi nhấn nút gửi
sendButton.addEventListener('click', () => {
    const messageText = chatInput.value.trim();
    if (!messageText) {
        console.log('Tin nhắn rỗng');
        return;
    }
    // Gửi POST request đến server
    fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, message: messageText })
    })
        .then(response => response.json())
        .then(data => {
            // Sau khi gửi thành công, thêm tin nhắn vào chatBox (với giả định server đã xử lý)
            appendMessage({ senderId: userId, message: messageText, timestamp: new Date() });
            chatInput.value = '';
        })
        .catch(err => console.error('Lỗi gửi tin:', err));
});
//phát âm thanh khi có tin nhắn mới
const nhac = new Audio('/audio/message.mp3');

// Lắng nghe sự kiện "newMessage" từ server
socket.on('newMessage', data => {
    console.log('Nhận tin nhắn mới:', data);
    // Phát âm thanh khi có tin nhắn mới
    nhac.muted = true;
    nhac.play().then(() => {
        nhac.muted = false; // Bật lại âm thanh sau khi được phép
    }).catch(error => console.warn("Không thể phát âm thanh:", error));

    appendMessage(data);
});




// (Tùy chọn) Gửi tin nhắn khi nhấn phím Enter
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendButton.click();
    }
});