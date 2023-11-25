import constants from './constants.js'
import functions from './functions.js'
const { elements, quizState } = constants

/**
 * Initializes the quiz and starts the eventlisteners
 */
function init () {
  // Event listener for keyboard input
  document.addEventListener('keydown', function (event) {
    // Handle Enter key for start, submit, and restart
    if (event.key === 'Enter') {
      if (elements.resultContainer.style.display === 'block') {
        functions.onRestartButtonClick(event) // Restart the quiz
      } else if (!elements.questionContainer.style.display || elements.questionContainer.style.display === 'none') {
        functions.onStartButtonClick(event) // Start the quiz
      } else {
        functions.onSubmitButtonClick(event) // Submit an answer
      }
    }

    // Handle Arrow keys for navigating multiple-choice options
    if (quizState.questionType === 'multiple-choice') {
      const radioButtons = elements.radioButtonsContainer.querySelectorAll('input[type="radio"]')
      let indexChanged = false
      if (event.key === 'ArrowDown') {
        quizState.currentSelectedRadioIndex = (quizState.currentSelectedRadioIndex + 1) % radioButtons.length
        indexChanged = true
      } else if (event.key === 'ArrowUp') {
        quizState.currentSelectedRadioIndex = (quizState.currentSelectedRadioIndex - 1 + radioButtons.length) % radioButtons.length
        indexChanged = true
      }
      if (indexChanged) {
        radioButtons[quizState.currentSelectedRadioIndex].focus() // Focus on the selected radio button
        radioButtons[quizState.currentSelectedRadioIndex].checked = true // Check the selected radio button
      }
    }

    // Handle Spacebar for selecting a radio option
    if (event.key === ' ' && quizState.questionType === 'multiple-choice') {
      const radioButtons = elements.radioButtonsContainer.querySelectorAll('input[type="radio"]')
      radioButtons[quizState.currentSelectedRadioIndex].checked = true // Check the selected radio button
    }
  })

  functions.setVisibility(elements.questionContainer, false) // Hide the question container
  functions.setVisibility(elements.resultContainer, false) // Hide the result container
  elements.startButton.addEventListener('click', functions.onStartButtonClick) // Event listener for the start button
  elements.submitButton.addEventListener('click', functions.onSubmitButtonClick) // Event listener for the submit button
  elements.restartButton.addEventListener('click', functions.onRestartButtonClick) // Event listener for the restart button

  // Event listener for the "View High Scores" link
  const highScoreLink = document.getElementById('highscore-link')
  highScoreLink.addEventListener('click', functions.onViewHighScoresClick)
}
init()
