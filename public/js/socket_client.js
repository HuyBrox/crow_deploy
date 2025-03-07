//khởi tạo nhạc chuông/nhạc chờ
const nhacChuong = new Audio('/audio/snaptik.vn_17626.mp3');
const nhacCho = new Audio('/audio/nhac_cho.mp3');

//hàm phát nhạc
const phatNhac = (nhac) => {
    nhac.loop = true;
    nhac.play().catch(error => console.warn("Không thể phát âm thanh:", error));
};
//hàm dừng nhạc
const dungNhac = (nhac) => {
    nhac.pause();
    nhac.currentTime = 0;
}

document.addEventListener('DOMContentLoaded', () => {
    // Lấy thông tin user (giả sử input có class "userId" đã có trên trang)
    const userId = document.querySelector('.userId')?.value;
    if (!userId) return;

    // Kết nối Socket.io (lưu ý: chỉnh sửa URL nếu cần)
    const socket = io('http://localhost:5000', { query: { userId } });
    window.socket = socket;
    // Xử lý danh sách online users (giữ nguyên)
    // socket.on('getOnlineUsers', (onlineUserIds) => {
    //     console.log("🟢 Danh sách user online:", onlineUserIds);
    //     document.querySelectorAll('.person').forEach(person => {
    //         const userIdElement = person.querySelector('p');
    //         const userIdText = userIdElement?.textContent || '';
    //         const statusElement = person.querySelector('.trang_thai p');
    //         if (statusElement) {
    //             const isOnline = onlineUserIds.includes(userIdText);
    //             statusElement.textContent = isOnline ? 'Online' : 'Offline';
    //             statusElement.className = isOnline ? 'online' : 'offline';
    //         }
    //     });
    // });
    socket.on('getOnlineUsers', (onlineUserIds) => {
        console.log("🟢 Danh sách user online:", onlineUserIds);
        document.querySelectorAll('.person').forEach(person => {
            const chatButton = person.querySelector('.chat-button'); // Lấy button có dataset.receiverId
            const userId = chatButton?.dataset.receiverId; // Lấy _id từ dataset
            const statusElement = person.querySelector('.trang_thai p');

            if (statusElement && userId) {
                const isOnline = onlineUserIds.includes(userId);
                statusElement.textContent = '✓'; // Dấu tích thay vì chữ
                statusElement.className = isOnline ? 'online' : 'offline'; // Gán class để đổi màu
            }
        });
    });

    // *** TẠO ĐỐI TƯỢNG PEER NGAY LẬP TỨC ***
    // Đối với cả caller và callee, Peer phải được khởi tạo sớm để đảm bảo rằng
    // peer.id đã có khi cần gửi hoặc nhận cuộc gọi.
    const peer = new Peer(undefined, {
        host: 'localhost',
        port: 5000,
        path: '/peerjs',
        secure: false,
        debug: 3,
    });

    // Lưu lại peer id khi đã được mở kết nối
    let currentPeerId = null;
    peer.on('open', id => {
        currentPeerId = id;
        console.log("PeerJS đã sẵn sàng với id:", id);
    });

    // Lấy các tham số từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const receiverId = urlParams.get('receiverId'); // Nếu là caller, đây là id người nhận
    const initiatingCall = urlParams.get('initiatingCall') === 'true'; // Nếu true => caller
    const callerPeerId = urlParams.get('callerPeerId'); // Nếu có, đây là peerId của caller (cho callee)
    const callerId = userId; // callerId là userId của chính mình

    // Biến chứa localStream khi lấy được media
    let localStream = null;

    // Hàm lấy media (camera, mic)
    async function getMedia() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            document.getElementById('localVideo').srcObject = localStream;
        } catch (err) {
            console.error('Lỗi khi lấy media:', err);
        }
    }

    // Hàm thực hiện gọi đến một peer (sử dụng localStream)
    function callPeer(targetPeerId) {
        const call = peer.call(targetPeerId, localStream);
        call.on('stream', remoteStream => {
            document.getElementById('remoteVideo').srcObject = remoteStream;
        });
        call.on('error', err => {
            console.error('Lỗi cuộc gọi:', err);
        });
    }

    // *** ĐỐI VỚI CALLER: Sau khi người dùng xác nhận, lấy media và gửi peerId cho receiver ***
    async function startCallerCall() {
        await getMedia();
        // Nếu peer đã mở (peer.id có giá trị) thì gửi ngay
        if (currentPeerId) {
            console.log("Peer ID của caller:", currentPeerId);
            socket.emit("sendPeerId", { receiverId, callerId, peerId: currentPeerId });
        } else {
            // Nếu chưa có, lắng nghe sự kiện 'open'
            peer.on('open', id => {
                socket.emit("sendPeerId", { receiverId, callerId, peerId: id });
            });
        }
    }

    // *** ĐỐI VỚI CALLEE: Sau khi xác nhận nhận cuộc gọi, lấy media và thực hiện gọi đến caller ***
    async function startCalleeCall() {
        await getMedia();
        if (currentPeerId) {
            console.log("Peer ID của callee:", currentPeerId);
            callPeer(callerPeerId);
        } else {
            peer.on('open', id => {
                callPeer(callerPeerId);
            });
        }
    }

    // Nếu URL chứa tham số initiatingCall (caller)
    if (initiatingCall && receiverId) {
        const ringingSound = new Audio('/audio/snaptik.vn_17626.mp3');
        ringingSound.loop = true;


        const confirmCall = confirm("📞 Bạn có chắc muốn gọi video không?");

        //dừng nhạc
        dungNhac(nhacChuong);

        ringingSound.currentTime = 0; // Reset về đầu

        if (confirmCall) {
            startCallerCall();
        } else {
            window.close(); // Đóng tab nếu người dùng từ chối gọi
        }
    }


    // Nếu URL chứa callerPeerId (callee)
    if (callerPeerId) {

        const confirmReceive = confirm("📞 Có cuộc gọi đến. Bạn có muốn nhận cuộc gọi không?");

        if (confirmReceive) {
            startCalleeCall();
        } else {
            window.close(); // Đóng tab nếu người dùng từ chối nhận cuộc gọi
        }
    }

    // Khi socket nhận sự kiện "receivePeerId" từ server,
    // tức là bên caller gửi peerId cho receiver, mở cửa sổ mới cho callee
    socket.on("receivePeerId", ({ callerId, peerId }) => {
        console.log("📞 Nhận cuộc gọi từ:", callerId, "peerId:", peerId);
        const callUrl = `/call?receiverId=${callerId}&callerPeerId=${peerId}`;
        //phát nhạc chờ
        nhacCho.muted = true;
        nhacCho.play().then(() => {
            nhacCho.muted = false;
        }).catch(error => console.warn("Không thể phát âm thanh:", error));
        console.log("url:", callUrl);

        const newWindow = window.open(callUrl, "_blank");
        if (!newWindow) {
            alert("Trình duyệt đã chặn popup. Vui lòng tắt chặn popup và thử lại.");
        }

    });


    // Xử lý lỗi từ PeerJS
    peer.on('error', err => {
        console.error('PeerJS error:', err);
    });

    // Xử lý cuộc gọi đến từ phía bên kia (nếu chưa được xử lý qua URL)
    peer.on('call', call => {
        // Nếu đã có localStream thì answer luôn, nếu chưa có thì gọi getMedia trước
        if (localStream) {
            call.answer(localStream);
        } else {
            getMedia().then(() => call.answer(localStream))
                .catch(err => console.error('Không lấy được media để answer cuộc gọi:', err));
        }
        call.on('stream', remoteStream => {
            document.getElementById('remoteVideo').srcObject = remoteStream;
        });
    });

    // Xử lý nút gọi video trên trang danh sách người dùng
    document.querySelectorAll(".call-button").forEach(button => {
        button.addEventListener("click", () => {
            const targetReceiverId = button.getAttribute("data-receiver-id");
            if (!targetReceiverId) return;
            // Khi click, mở một tab mới với tham số initiatingCall=true
            const callUrl = `/call?receiverId=${targetReceiverId}&initiatingCall=true`;
            //phát nhạc chuông
            phatNhac(nhacChuong);
            window.open(callUrl, "_blank");
        });
    });
    //xử lí nút trang chat
    document.querySelectorAll(".chat-button").forEach(button => {
        button.addEventListener("click", () => {
            const targetReceiverId = button.getAttribute("data-receiver-id");
            if (!targetReceiverId) return;
            const chatUrl = `/chat?receiverId=${targetReceiverId}`;
            window.open(chatUrl);
        });
    });
});
