let lastScrollY = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > window.innerHeight / 2) {
        // Cuộn xuống và vượt quá 1 màn hình, ẩn header
        header.classList.add('hidden');
    } else {
        // Cuộn lên, hiện header
        header.classList.remove('hidden');
    }

    lastScrollY = currentScrollY;
});

//Show alert
const showAlert = document.querySelector('[show-alert]');
if (showAlert) {
    const timeOut = parseInt(showAlert.getAttribute('data-time'), 10) || 5000;
    const closeAlert = showAlert.querySelector('.close-alert');

    setTimeout(() => {
        showAlert.classList.add('alert-hidden');
    }, timeOut);

    if (closeAlert) {
        closeAlert.addEventListener('click', () => {
            showAlert.classList.add('alert-hidden');
        });
    }
}

// //Show contact list
// document.addEventListener('DOMContentLoaded', () => {
//     const openBtn = document.getElementById('open-contact-btn');
//     const closeBtn = document.getElementById('close-contact-btn');
//     const contactList = document.getElementById('contact-list');

//     openBtn.addEventListener('click', () => {
//         contactList.classList.add('show');
//     });

//     closeBtn.addEventListener('click', () => {
//         contactList.classList.remove('show');
//     });
// });
document.addEventListener('DOMContentLoaded', async () => {
    const openBtn = document.getElementById('open-contact-btn');
    const closeBtn = document.getElementById('close-contact-btn');
    const contactList = document.getElementById('contact-list');
    const searchInput = document.getElementById('search-contact');
    const contactItems = document.getElementById('contact-items');

    // Mở/đóng danh sách liên hệ
    openBtn.addEventListener('click', () => {
        contactList.classList.add('show');
    });

    closeBtn.addEventListener('click', () => {
        contactList.classList.remove('show');
    });

    // Lấy currentUserId từ input ẩn trong header
    const currentUserId = document.querySelector('.userId').value;

    // Hàm lấy danh sách người dùng từ API hoặc localStorage
    async function getUsers() {
        const cacheKey = 'cachedUsers';
        const cacheTimeKey = 'cachedUsersTime';
        const cacheDuration = 15 * 60 * 1000; // 15 phút

        const cachedData = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);

        // Kiểm tra nếu có cache và chưa hết hạn
        if (cachedData && cachedTime) {
            const age = Date.now() - parseInt(cachedTime);
            if (age < cacheDuration) {
                const users = JSON.parse(cachedData);
                return Array.isArray(users) ? users : [];
            }
        }

        // Fetch từ API nếu không có cache hoặc cache hết hạn
        try {
            const response = await fetch('/getUsers', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
                }
            });
            if (!response.ok) {
                throw new Error('Không thể lấy danh sách người dùng');
            }
            const result = await response.json();
            const users = result.data || []; // Trích xuất mảng từ thuộc tính 'data'
            if (!Array.isArray(users)) {
                throw new Error('Dữ liệu trả về từ API không phải là mảng');
            }
            localStorage.setItem(cacheKey, JSON.stringify(users));
            localStorage.setItem(cacheTimeKey, Date.now().toString());
            return users;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách người dùng:', error);
            return [];
        }
    }

    // Hàm hiển thị danh sách liên hệ
    function renderContacts(users, currentUserId) {
        contactItems.innerHTML = '';

        if (!Array.isArray(users)) {
            console.error('users không phải là mảng:', users);
            return;
        }

        users.forEach(user => {
            if (user._id === currentUserId) return;

            const personDiv = document.createElement('div');
            personDiv.classList.add('person');

            const nameH3 = document.createElement('h3');
            nameH3.textContent = user.fullname || 'Không có tên';

            const idP = document.createElement('p');
            idP.textContent = user.username || user._id;

            const statusDiv = document.createElement('div');
            statusDiv.classList.add('trang_thai');
            statusDiv.id = `status-${user._id}`;

            const statusP = document.createElement('p');
            statusP.textContent = '✓'; // Dấu tích thay vì chữ
            statusP.classList.add(user.lastActiveAt ? 'online' : 'offline'); // Trạng thái ban đầu dựa trên lastActiveAt

            statusDiv.appendChild(statusP);

            const callButton = document.createElement('button');
            callButton.textContent = 'Gọi Video';
            callButton.classList.add('call-button');
            callButton.dataset.receiverId = user._id;

            const chatButton = document.createElement('button');
            chatButton.textContent = 'Chat';
            chatButton.classList.add('chat-button');
            chatButton.dataset.receiverId = user._id;

            personDiv.appendChild(nameH3);
            personDiv.appendChild(idP);
            personDiv.appendChild(statusDiv);
            personDiv.appendChild(callButton);
            personDiv.appendChild(chatButton);

            contactItems.appendChild(personDiv);
        });
    }

    // Hàm lọc danh sách liên hệ theo từ khóa
    function filterContacts(query) {
        const persons = document.querySelectorAll('.person');
        persons.forEach(person => {
            const name = person.querySelector('h3').textContent.toLowerCase();
            const username = person.querySelector('p').textContent.toLowerCase();
            if (name.includes(query) || username.includes(query)) {
                person.style.display = '';
            } else {
                person.style.display = 'none';
            }
        });
    }

    // Lấy danh sách người dùng và hiển thị
    const users = await getUsers();
    renderContacts(users, currentUserId);

    // Thêm sự kiện tìm kiếm
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        filterContacts(query);
    });
});