document.addEventListener('DOMContentLoaded', function () {
    // Get JSON task data from hidden input
    const jsonTaskString = document.getElementById("sheetName").value;

    if (!jsonTaskString) {
        console.error("No jsonTask data provided");
        return;
    }

    let questions;
    try {
        const taskData = JSON.parse(jsonTaskString);
        questions = taskData.questions;
    } catch (error) {
        console.error("Error parsing jsonTask data:", error);
        return;
    }

    // DOM Elements
    const quizTimer = document.querySelector("#timer");
    const quizProgress = document.querySelector("#progress");
    const quizProgressText = document.querySelector("#progress_text");
    const quizSubmit = document.querySelector("#quiz_submit");
    const quizPrev = document.querySelector("#quiz_prev");
    const quizNext = document.querySelector("#quiz_next");
    const quizCount = document.querySelector(".quiz_question h5");
    const quizAnswers = document.querySelectorAll(".quiz_question ul li");
    const quizQuestionList = document.querySelector(".quiz_numbers ul");
    const quizAnswersItem = document.querySelectorAll(".quiz_answer_item");
    const quizTitle = document.querySelector("#quiz_title");

    // Quiz state variables
    let currentIndex = 0;
    let selectedAnswers = new Array(questions.length).fill(null);
    let quizResults = [];
    let isQuizSubmitted = false;
    let timeLeft = 10 * 60;
    let timerInterval;


    const quiz = {

        init() {
            this.renderQuestionList();
            this.renderCurrentQuestion();
            this.setupEventListeners();
            this.startTimer();
            this.updateProgressCircle();
        },


        renderQuestionList() {
            quizQuestionList.innerHTML = questions.map((_, index) => {
                let className = '';
                if (selectedAnswers[index] !== null) {
                    className = 'selected';
                }
                return `<li class="${className}">${index + 1}</li>`;
            }).join('');


            const questionNumberItems = quizQuestionList.querySelectorAll('li');
            questionNumberItems.forEach((item, index) => {
                item.addEventListener('click', () => {
                    currentIndex = index;
                    this.renderCurrentQuestion();
                });
            });
        },


        renderCurrentQuestion() {
            if (questions.length === 0 || currentIndex >= questions.length) return;

            const currentQuestion = questions[currentIndex];

            quizCount.innerText = `Question ${currentIndex + 1} of ${questions.length}`;
            quizTitle.innerText = currentQuestion.question;


            quizAnswersItem.forEach((answer, index) => {
                answer.innerText = currentQuestion.answers[index];
            });


            quizAnswers.forEach((answer, index) => {
                answer.classList.remove('active', 'incorrect');

                if (isQuizSubmitted) {

                    const currentResult = quizResults[currentIndex];
                    if (currentResult) {
                        const correctAnswerIndex = currentResult.correctAnswer;
                        const selectedAnswerIndex = currentResult.selectedAnswer;

                        if (index === correctAnswerIndex) {
                            answer.classList.add('active');
                        }

                        if (selectedAnswerIndex !== null &&
                            selectedAnswerIndex !== correctAnswerIndex &&
                            index === selectedAnswerIndex) {
                            answer.classList.add('incorrect');
                        }
                    }
                } else if (selectedAnswers[currentIndex] === index) {
                    answer.classList.add('active');
                }
            });

            this.updateQuestionListHighlight();
        },


        updateQuestionListHighlight() {
            const questionNumberItems = quizQuestionList.querySelectorAll('li');
            questionNumberItems.forEach((item, index) => {
                item.classList.remove('active', 'selected', 'incorrect');

                if (isQuizSubmitted && quizResults[index]) {

                    const currentResult = quizResults[index];
                    if (currentResult.selectedAnswer !== null &&
                        !currentResult.isCorrect) {
                        item.classList.add('incorrect');
                    }
                }

                if (selectedAnswers[index] !== null) {
                    item.classList.add('selected');
                }

                if (index === currentIndex) {
                    item.classList.add('active');
                }
            });
        },


        setupEventListeners() {

            quizAnswers.forEach((answer, index) => {
                answer.addEventListener('click', () => {
                    if (isQuizSubmitted) return;

                    quizAnswers.forEach(a => a.classList.remove('active'));
                    answer.classList.add('active');
                    selectedAnswers[currentIndex] = index;

                    this.updateProgressCircle();
                    this.updateQuestionListHighlight();
                });
            });


            quizPrev.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    this.renderCurrentQuestion();
                }
            });

            quizNext.addEventListener('click', () => {
                if (currentIndex < questions.length - 1) {
                    currentIndex++;
                    this.renderCurrentQuestion();
                }
            });


            quizSubmit.addEventListener('click', () => {
                if (!isQuizSubmitted) {
                    this.submitQuiz();
                }
            });
        },


        updateProgressCircle() {
            const completedQuestions = selectedAnswers.filter(answer => answer !== null).length;
            const r = quizProgress.getAttribute('r');
            const circumference = 2 * Math.PI * r;

            quizProgress.style.strokeDasharray =
                `${(circumference * completedQuestions) / questions.length} 9999`;

            quizProgressText.innerText = `${completedQuestions}/${questions.length}`;
        },

        // Timer management
        startTimer() {
            const timerElement = document.getElementById('timer');

            const updateTimer = () => {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;

                timerElement.textContent =
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                if (timeLeft <= 0) {
                    timerElement.textContent = "Time's up!";
                    this.submitQuiz();
                    return;
                }

                if (!isQuizSubmitted) {
                    timeLeft--;
                }
            };

            timerInterval = setInterval(updateTimer, 1000);
        },


        submitQuiz() {
            clearInterval(timerInterval);
            isQuizSubmitted = true;
            quizSubmit.innerText = "Submitted";
            quizSubmit.disabled = true;

            let correctCount = 0;
            quizResults = questions.map((question, index) => {
                const correctAnswerIndex = question.correct_answer;
                const selectedAnswer = selectedAnswers[index];
                const isCorrect = (selectedAnswer === correctAnswerIndex);

                if (isCorrect) correctCount++;

                return {
                    questionIndex: index,
                    selectedAnswer: selectedAnswer,
                    correctAnswer: correctAnswerIndex,
                    isCorrect: isCorrect
                };
            });


            const r = quizProgress.getAttribute('r');
            const circumference = 2 * Math.PI * r;

            quizProgress.style.strokeDasharray =
                `${(circumference * correctCount) / questions.length} 9999`;

            quizProgressText.innerText = `${correctCount}/${questions.length}`;

            // Render the current question with correct/incorrect markings
            this.renderCurrentQuestion();
            this.updateQuestionListHighlight();
        }
    };

    // Initialize quiz
    quiz.init();
});