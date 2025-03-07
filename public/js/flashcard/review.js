document.addEventListener('DOMContentLoaded', function () {
    const gradeButton = document.getElementById('grade-review'); // Nút chấm điểm
    const restartButton = document.getElementById('restart');    // Nút làm lại

    gradeButton.addEventListener('click', function () {
        let score = 0; // Biến đếm số câu đúng
        const quizItems = document.querySelectorAll('.quiz-item'); // Lấy tất cả các câu hỏi

        quizItems.forEach((item, index) => {
            // Lấy ô input chứa đáp án của người dùng và đáp án đúng
            const inputField = item.querySelector(`input[name="answer-${index}"]`);
            const userAnswerOriginal = inputField.value; // Đáp án gốc của người dùng
            const userAnswer = userAnswerOriginal.trim().toLowerCase(); // Đáp án dùng để so sánh
            const correctAnswerOriginal = item.querySelector(`input[name="correct-${index}"]`).value; // Đáp án đúng gốc
            const correctAnswer = correctAnswerOriginal.trim().toLowerCase(); // Đáp án đúng để so sánh

            // Lấy phần tử hiển thị kết quả (biểu tượng và chữ "Đúng"/"Sai")
            const resultDiv = item.querySelector('.result');
            const icon = resultDiv.querySelector('.icon');
            const text = resultDiv.querySelector('.text');

            if (userAnswer === correctAnswer) {
                // Nếu đúng
                score++;
                resultDiv.classList.add('correct');
                icon.classList.add('fas', 'fa-check-circle'); // Biểu tượng dấu kiểm xanh
                text.textContent = 'Đúng';
            } else {
                // Nếu sai, cập nhật ô input thành "đáp án trả lời - đáp án đúng"
                inputField.value = `${userAnswerOriginal} - ${correctAnswerOriginal}`;
                resultDiv.classList.add('incorrect');
                icon.classList.add('fas', 'fa-times-circle'); // Biểu tượng dấu "x" đỏ
                text.textContent = 'Sai';
            }

            // Hiển thị kết quả và vô hiệu hóa ô input
            resultDiv.style.display = 'inline-block';
            inputField.disabled = true;
        });

        // Cập nhật điểm số và hiển thị phần kết quả
        document.querySelector('#score span').textContent = score;
        document.getElementById('review-results').style.display = 'block';
    });
    //hi
    // Xử lý nút làm lại: tải lại trang
    restartButton.addEventListener('click', function () {
        window.location.reload();
        window.scrollTo(0, 0);
    });
});