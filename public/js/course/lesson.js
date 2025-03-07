// document.addEventListener("DOMContentLoaded", () => {
//     document.querySelectorAll(".lesson-link").forEach(link => {
//         link.addEventListener("click", async (event) => {
//             event.preventDefault(); // Ngăn trang load lại

//             const lessonLink = event.target.closest(".lesson-link");
//             if (!lessonLink) return;

//             const lessonId = lessonLink.dataset.lessonId;
//             const courseId = window.location.pathname.split("/")[2]; // Lấy ID khóa học

//             try {
//                 const response = await fetch(`/course/${courseId}/lesson/${lessonId}`, {
//                     headers: { "X-Requested-With": "XMLHttpRequest" } // Đánh dấu AJAX request
//                 });

//                 if (!response.ok) {
//                     console.error("Lỗi tải bài học:", response.statusText);
//                     return;
//                 }

//                 const data = await response.json();

//                 document.getElementById("lesson-title").textContent = data.title;
//                 document.getElementById("lesson-description").textContent = data.description;

//                 // Cập nhật video
//                 const videoElement = document.getElementById("lesson-video");
//                 if (videoElement) {
//                     if (data.videoUrl) {
//                         videoElement.src = data.videoUrl;
//                         videoElement.style.display = "block";
//                     } else {
//                         videoElement.style.display = "none";
//                     }
//                 }

//                 // Đánh dấu bài học đang xem
//                 document.querySelectorAll(".lesson-list li").forEach(li => li.classList.remove("active"));
//                 lessonLink.parentElement.classList.add("active");

//                 console.log("Cập nhật bài học thành công!");
//             } catch (error) {
//                 console.error("Lỗi:", error);
//             }
//         });
//     });
// });







