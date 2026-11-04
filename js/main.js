import { getRandomQuestion, generateAnswers, checkAnswer } from "./game.js";
import { getBestResult, saveResult, getTopResults } from "./storage.js";

/* DOM */
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");
const levelButtons = document.querySelectorAll(".level-btn");

const scoreElement = document.getElementById("score");
const questionNumber = document.getElementById("question-number");
const mathQuestion = document.getElementById("math-question");

const answerButtons = document.querySelectorAll(".answer-btn");
const feedback = document.getElementById("feedback");

const nextButton = document.getElementById("next-btn");
const restartButton = document.getElementById("restart-btn");

const progressBar = document.getElementById("progress-bar");
const rocket = document.getElementById("rocket");
const finalScore = document.getElementById("final-score");
const timerElement = document.getElementById("timer");
const bestScore = document.getElementById("best-score");
const resultsBody = document.getElementById("results-body");
const resultsLevel = document.getElementById("results-level");
/* Game */
const TOTAL_QUESTIONS = 10;
const POINTS_PER_ANSWER = 1;
let currentLevel = "easy";
let currentQuestion = null;

let score = 0;
let questionIndex = 0;
let answered = false;

const usedQuestionIds = new Set();

/* screen */

function showScreen(screen) {
  startScreen.hidden = screen !== "start";
  gameScreen.hidden = screen !== "game";
  resultScreen.hidden = screen !== "result";
}
/* Start game */
function startGame(level) {
  currentLevel = level;
  score = 0;
  questionIndex = 0;
  answered = false;

  usedQuestionIds.clear();
  scoreElement.textContent = score;
  progressBar.style.width = "0%";
  rocket.style.left = "10%";

  showScreen("game");
  showQuestion();
}
// ============================
// SHOW QUESTION
// ============================

function showQuestion() {
  answered = false;

  feedback.textContent = "";
  nextButton.hidden = true;

  questionIndex++;
  questionNumber.textContent = questionIndex;

  // Отримуємо приклад без повторення
  let question;
  let attempts = 0;

  do {
    question = getRandomQuestion(currentLevel);
    attempts++;
  } while (usedQuestionIds.has(question.id) && attempts < 100);

  usedQuestionIds.add(question.id);
  currentQuestion = question;

  mathQuestion.textContent = `${question.question} = ?`;

  const answers = generateAnswers(question.answer);
  console.log("Question:", question);
  console.log("Generated answers:", answers);
  console.log("Correct answer included:", answers.includes(question.answer));

  answerButtons.forEach((button, index) => {
    button.textContent = answers[index];

    button.disabled = false;

    button.classList.remove("correct", "incorrect");
  });
  timerCount(20);
}

// ============================
// CHECK ANSWER
// ============================

function handleAnswer(event) {
  if (answered) return;
  clearInterval(timerInterval);
  answered = true;

  const button = event.currentTarget;
  const selectedAnswer = Number(button.textContent);

  const isCorrect = checkAnswer(currentQuestion, selectedAnswer);

  if (isCorrect) {
    score += POINTS_PER_ANSWER;

    scoreElement.textContent = score;

    button.classList.add("correct");

    feedback.textContent = "🌟 Молодець! Правильна відповідь!";
    feedback.style.color = "var(--accent-green)";
  } else {
    button.classList.add("incorrect");

    feedback.textContent = `Спробуємо далі! Правильна відповідь: ${currentQuestion.answer}`;

    feedback.style.color = "var(--accent-pink)";

    // Показуємо правильну відповідь
    answerButtons.forEach((answerButton) => {
      if (Number(answerButton.textContent) === currentQuestion.answer) {
        answerButton.classList.add("correct");
      }
    });
  }

  answerButtons.forEach((answerButton) => {
    answerButton.disabled = true;
  });

  updateProgress();

  nextButton.textContent =
    questionIndex === TOTAL_QUESTIONS
      ? "Завершити місію 🚀"
      : "Наступне завдання ➜";

  nextButton.hidden = false;
}

// ============================
// UPDATE PROGRESS
// ============================

function updateProgress() {
  const progress = (questionIndex / TOTAL_QUESTIONS) * 100;

  progressBar.style.width = `${progress}%`;
  const rocketLeft = 10 + progress * 0.55;
  const rocketBottom = 10 + progress * 0.45;

  rocket.style.left = `${rocketLeft}%`;
  rocket.style.bottom = `${rocketBottom}%`;
}

// ============================
// NEXT QUESTION
// ============================

function nextQuestion() {
  if (!answered) return;

  if (questionIndex >= TOTAL_QUESTIONS) {
    finishGame();
  } else {
    showQuestion();
  }
}

// ============================
// FINISH GAME
// ============================

function finishGame() {
  clearInterval(timerInterval);

  finalScore.textContent = score;

  showScreen("result");

  try {
    saveResult(currentLevel, score, TOTAL_QUESTIONS * POINTS_PER_ANSWER);

    renderResults(currentLevel);
  } catch (error) {
    console.error("Помилка під час формування результатів:", error);
  }
}

let timerInterval = null;
let timeLeft = 0;

function timerCount(time) {
  clearInterval(timerInterval);

  timeLeft = time;
  timerElement.textContent = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;

    timerElement.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      answered = true;

      feedback.textContent = "⏰ Час вийшов!";
      feedback.style.color = "var(--accent-pink)";

      answerButtons.forEach((button) => {
        button.disabled = true;

        if (Number(button.textContent) === currentQuestion.answer) {
          button.classList.add("correct");
        }
      });
      updateProgress();

      nextButton.textContent =
        questionIndex === TOTAL_QUESTIONS
          ? "Завершити місію 🚀"
          : "Наступне завдання ➜";

      nextButton.hidden = false;
    }
  }, 1000);
}

// ============================
// RESTART GAME
// ============================

function restartGame() {
  showScreen("start");
  clearInterval(timerInterval);
}

// ============================
// EVENT LISTENERS
// ============================

levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const level = button.dataset.level;
    startGame(level);
  });
});

answerButtons.forEach((button) => {
  button.addEventListener("click", handleAnswer);
});

nextButton.addEventListener("click", nextQuestion);

restartButton.addEventListener("click", restartGame);

showScreen("start");
/* ============================
   RESULTS TABLE
============================ */

function renderResults(level) {
  const best = getBestResult(level);
  const results = getTopResults(level, 3);

  const levelNames = {
    easy: "🌍 Земля",
    medium: "🪐 Марс",
    hard: "🚀 Юпітер",
  };

  bestScore.textContent = best ? best.score : 0;

  resultsLevel.textContent = `Рівень: ${levelNames[level]}`;

  // Очищаємо таблицю перед заповненням
  resultsBody.replaceChildren();

  results.forEach((result, index) => {
    const row = document.createElement("tr");

    const placeCell = document.createElement("td");
    const dateCell = document.createElement("td");
    const scoreCell = document.createElement("td");

    placeCell.textContent = index === 0 ? "🥇 1" : index + 1;

    dateCell.textContent = result.date;

    scoreCell.textContent = `${result.score} / ${result.total}`;

    if (index === 0) {
      row.classList.add("top-result");
    }

    row.append(placeCell, dateCell, scoreCell);
    resultsBody.append(row);
  });
}
