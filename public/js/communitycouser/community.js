
// Popup đăng bài
function openPostPopup() {
    document.getElementById("postPopup").style.display = "flex";
}

function closePostPopup() {
    document.getElementById("postPopup").style.display = "none";
}

// Menu tùy chọn
function toggleOptionsMenu(button) {
    const menu = button.nextElementSibling;
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// Xóa bài viết
function deletePost(postId) {
    if (confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
        fetch(`/community/delete/${postId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const postElement = document.querySelector(`.post[data-post-id="${postId}"]`);
                if (postElement) {
                    postElement.remove();
                }
            } else {
                alert(data.message || "Có lỗi khi xóa bài viết");
            }
        })
        .catch(error => {
            console.error("Lỗi khi xóa bài viết:", error);
            alert("Không thể thực hiện hành động này");
        });
    }
}

// Chỉnh sửa bài viết
function editPost(postId) {
    const postElement = document.querySelector(`.post[data-post-id="${postId}"]`);
    const caption = postElement.querySelector('h2').textContent;
    const desc = postElement.querySelector('p').textContent;

    const editPopup = document.createElement('div');
    editPopup.className = 'edit-popup';
    editPopup.innerHTML = `
        <div class="popup-content">
            <h2>Chỉnh sửa bài viết</h2>
            <form id="editForm">
                <div class="form-group">
                    <label for="editCaption">Tiêu đề</label>
                    <input id="editCaption" type="text" name="caption" value="${caption}" required>
                </div>
                <div class="form-group">
                    <label for="editDesc">Nội dung</label>
                    <textarea id="editDesc" name="desc" rows="4" required>${desc}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="cancel-btn">Hủy</button>
                    <button type="submit">Lưu</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(editPopup);

    // Xử lý sự kiện form
    const editForm = editPopup.querySelector('#editForm');
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newCaption = editForm.querySelector('#editCaption').value;
        const newDesc = editForm.querySelector('#editDesc').value;

        try {
            const response = await fetch(`/community/edit/${postId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ caption: newCaption, desc: newDesc })
            });

            const data = await response.json();
            if (data.success) {
                postElement.querySelector('h2').textContent = data.post.caption;
                postElement.querySelector('p').textContent = data.post.desc;
                editPopup.remove();
            } else {
                alert(data.message || "Có lỗi khi chỉnh sửa bài viết");
            }
        } catch (error) {
            console.error("Lỗi khi chỉnh sửa bài viết:", error);
            alert("Không thể thực hiện hành động này");
        }
    });

    editPopup.querySelector('.cancel-btn').addEventListener('click', () => {
        editPopup.remove();
    });
}


//comment
function createComment(postId, commentText, commentSection) {
    fetch(`/community/comment/${postId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: commentText }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {

                const noCommentMessage = commentSection.querySelector("p");
                if (noCommentMessage && noCommentMessage.textContent === "Chưa có bình luận nào hãy là người đầu tiên bình luận!") {
                    noCommentMessage.remove();
                }

                // Thêm bình luận mới vào giao diện
                const newComment = document.createElement("div");
                newComment.className = "comment";
                const commentDate = new Date(data.comment.createdAt).toLocaleDateString("vi-VN");
                newComment.innerHTML = `
                    <div class="user-info">
                        <img class="avatar" src="${data.comment.author.avatar}" alt="User Avatar">
                        <span class="by">by</span>
                        <span class="username">${data.comment.author.username}</span>
                        <span class="time">/ ${commentDate}</span>
                    </div>
                    <p>${data.comment.text}</p>
                `;
                commentSection.insertBefore(newComment, commentSection.querySelector(".comment-box"));

                
                const commentCount = commentSection.parentElement.querySelector(".likes span:nth-child(4)");
                commentCount.textContent = parseInt(commentCount.textContent) + 1;

                commentSection.querySelector(".comment-text").value = "";
            } else {
                alert(data.message || "Có lỗi khi thêm bình luận");
            }
        })
        .catch((error) => {
            console.error("Lỗi khi gửi bình luận:", error);
            alert("Không thể thực hiện hành động này");
        });
}
//khong cho chan
if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'; 
}
// Sk DOM 
document.addEventListener("DOMContentLoaded", () => {

    window.scrollTo(0, 0);
    
    document.getElementById("postInput").addEventListener("click", openPostPopup);
    
    document.querySelectorAll(".cancel-btn").forEach(btn => {
        btn.addEventListener("click", closePostPopup);
    });
    
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const postId = btn.dataset.postId;
            editPost(postId);
        });
    });

    document.addEventListener("click", (event) => {
        document.querySelectorAll(".options-dropdown").forEach(menu => {
            if (!menu.parentElement.contains(event.target)) {
                menu.style.display = "none";
            }
        });
    });

    document.querySelectorAll(".options-btn").forEach(btn => {
        btn.addEventListener("click", () => toggleOptionsMenu(btn));
    });

    document.querySelectorAll(".comment-submit").forEach((btn) => {
        btn.addEventListener("click", () => {
            const commentBox = btn.parentElement;
            const commentText = commentBox.querySelector(".comment-text").value.trim();
            const postElement = commentBox.closest(".post");
            const postId = postElement.dataset.postId;
            const commentSection = postElement.querySelector(".comments");

            if (commentText) {
                createComment(postId, commentText, commentSection);
            } else {
                alert("Vui lòng nhập nội dung bình luận!");
            }
        });
    });

    document.querySelectorAll(".comment-text").forEach((input) => {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) { 
                e.preventDefault(); // Ngăn Enter tạo dòng mới
                const commentBox = input.parentElement;
                const commentText = input.value.trim();
                const postElement = commentBox.closest(".post");
                const postId = postElement.dataset.postId;
                const commentSection = postElement.querySelector(".comments");

                if (commentText) {
                    createComment(postId, commentText, commentSection);
                } else {
                    alert("Vui lòng nhập nội dung bình luận!");
                }
            }
        });
    });
 
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => deletePost(btn.dataset.postId));
    });

    document.querySelectorAll(".like-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const postId = button.getAttribute("data-post-id");
            try {
                const response = await fetch(`/community/like/${postId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const data = await response.json();
                if (data.success) {
                    const likesCount = button.nextElementSibling;
                    likesCount.textContent = data.likesCount;
                    if (data.hasLiked) {
                        button.classList.add("liked");
                    } else {
                        button.classList.remove("liked");
                    }
                } else {
                    alert(data.message || "Có lỗi xảy ra khi thích bài viết");
                }
            } catch (error) {
                console.error("Lỗi khi gửi yêu cầu Like:", error);
                alert("Không thể thực hiện hành động này");
            }
        });
    });
});

