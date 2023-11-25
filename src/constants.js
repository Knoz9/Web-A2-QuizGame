/**
 * Define the URL of the first quiz question.
 */
const startUrl = 'https://courselab.lnu.se/quiz/question/1'

/**
 * Define an object to store references to HTML elements.
 */
const elements = {
  // References to various HTML elements
  nameForm: document.getElementById('nickname-form'), // User's name input form
  startButton: document.getElementById('start-btn'), // Start button
  submitButton: document.getElementById('submit-answer'), // Submit button
  questionElement: document.getElementById('question'), // Element to display the quiz question
  answerInput: document.getElementById('text-answer'), // Text input for answers
  radioButtonsContainer: document.getElementById('multiple-choice-container'), // Container for multiple-choice options
  questionContainer: document.getElementById('quiz-container'), // Container for the quiz questions
  resultElement: document.getElementById('result-message'), // Element to display quiz results
  resultContainer: document.getElementById('result-screen'), // Container for quiz results
  timerDisplay: document.getElementById('time-left'), // Element to display the timer
  restartButton: document.getElementById('restart-btn'), // Restart button
  progressBar: document.getElementById('progress-bar'), // Progress bar element
  scoreTable: document.getElementById('score-table'), // Score table element
  currentSelectedRadioIndex: 0 // Index of the currently selected radio button for multiple-choice questions
}

/**
 * Define an object to store the state of the quiz.
 */
const quizState = {
  userName: '', // User's name
  userTimeStart: null, // Start time of the quiz
  questionType: 'text', // Type of question ('text' or 'multiple-choice')
  nextQuestionUrl: '', // URL of the next question
  highScores: [], // Array to store high scores
  currentSelectedRadioIndex: -1 // Index of the currently selected radio button for multiple-choice questions
}

export default { elements, quizState, startUrl }
