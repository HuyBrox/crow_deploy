document.addEventListener('DOMContentLoaded', async () => {
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    const toggleMicBtn = document.getElementById('toggleMic');
    const toggleVideoBtn = document.getElementById('toggleVideo');
    const endCallBtn = document.getElementById('endCall');

    let localStream;

    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
    } catch (error) {
        console.error("Không thể truy cập camera/micro:", error);
        return;
    }


    let audioTrack = localStream.getAudioTracks()[0];
    let videoTrack = localStream.getVideoTracks()[0];

    // Xử lý bật/tắt mic
    toggleMicBtn.addEventListener('click', () => {
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            toggleMicBtn.textContent = audioTrack.enabled ? "🔇 Tắt Mic" : "🎤 Bật Mic";
        }
    });

    // Xử lý bật/tắt video
    toggleVideoBtn.addEventListener('click', () => {
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            toggleVideoBtn.textContent = videoTrack.enabled ? "📹 Tắt Video" : "📷 Bật Video";
        }
    });

    // Xử lý kết thúc cuộc gọi
    endCallBtn.addEventListener('click', () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop()); // Dừng tất cả track
        }
        //đóng cửa sổ
        window.close();
    });
});
