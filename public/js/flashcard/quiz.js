document.addEventListener('DOMContentLoaded', () => {
    const quizForm = document.getElementById('quiz-form');
    const gradeButton = document.getElementById('grade-quiz');
    const quizResults = document.getElementById('quiz-results');
    const scoreElement = document.getElementById('score').querySelector('span');

    gradeButton.addEventListener('click', () => {
        let score = 0;
        const totalQuestions = quizForm.querySelectorAll('.quiz-question').length;

        quizForm.querySelectorAll('.quiz-question').forEach((question, index) => {
            const radios = question.querySelectorAll('input[type="radio"]');
            let selectedAnswer = null;
            let correctAnswer = null;


            radios.forEach(radio => {
                if (radio.checked) {
                    selectedAnswer = radio;
                }
                if (radio.dataset.correct === 'true') {
                    correctAnswer = radio;
                }
            });

            // Kiểm tra và đánh dấu
            radios.forEach(radio => {
                const answerDiv = radio.closest('.quiz-answer');
                if (radio === correctAnswer) {
                    answerDiv.classList.add('correct');
                }
                if (radio === selectedAnswer && radio !== correctAnswer) {
                    answerDiv.classList.add('incorrect');
                }
            });

            // Tăng điểm nếu chọn đúng
            if (selectedAnswer && selectedAnswer === correctAnswer) {
                score++;
            }
        });

        // Hiển thị kết quả
        quizResults.style.display = 'block';
        scoreElement.textContent = `${score}`;
        gradeButton.disabled = true;
    });
});