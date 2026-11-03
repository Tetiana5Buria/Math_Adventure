import { questions } from "./data/questions.js";

export function getRandomQuestion(level) {
  const selectedQuestions = questions[level];

  const randomIndex = Math.floor(Math.random() * selectedQuestions.length);

  return selectedQuestions[randomIndex];
}

export function generateAnswers(correctAnswer) {
  const answers = new Set([correctAnswer]);

  while (answers.size < 3) {
    const offset = Math.floor(Math.random() * 9) + 1;
    const sign = Math.random() < 0.5 ? -1 : 1;

    const wrongAnswer = correctAnswer + offset * sign;

    if (wrongAnswer >= 0 && wrongAnswer <= 100) {
      answers.add(wrongAnswer);
    }
  }

  const shuffledAnswers = [...answers];

  // Fisher–Yates shuffle
  for (let i = shuffledAnswers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffledAnswers[i], shuffledAnswers[j]] = [
      shuffledAnswers[j],
      shuffledAnswers[i],
    ];
  }

  return shuffledAnswers;
}

export function checkAnswer(question, selectedAnswer) {
  return question.answer === selectedAnswer;
}
