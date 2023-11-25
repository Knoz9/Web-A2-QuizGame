import constants from './constants.js'
const { elements, quizState, startUrl } = constants

/**
 * Function to handle "View High Scores" link click.
 * @param {Event} event - The click event.
 */
function onViewHighScoresClick (event) {
  event.preventDefault() // Prevent default link behavior
  displayHighScores() // Display high scores
}

/**
 * Function to display high scores.
 */
function displayHighScores () {
  // Retrieve high scores from local storage
  const highScores = JSON.parse(localStorage.getItem('highScoreList')) || []

  // HTML markup for displaying high scores
  let highScoreHtml = '<h2>Top 10 High Scores</h2>'
  highScoreHtml += '<table>'
  highScoreHtml += '<tr><th>Rank</th><th>Name</th><th>Time</th></tr>' // Table headers

  // Loop through high scores and format the HTML
  highScores.forEach((score, index) => {
    let rank
    switch (index) {
      case 0:
        rank = '🥇' // Gold
        break
      case 1:
        rank = '🥈' // Silver
        break
      case 2:
        rank = '🥉' // Bronze
        break
      default:
        rank = `${index + 1}` // 4th, 5th, etc.
        break
    }
    highScoreHtml += `<tr><td>${rank}</td><td>${score.name}</td><td>${score.time.toFixed(2)} seconds</td></tr>`
  })

  highScoreHtml += '</table>'

  elements.resultElement.innerHTML = highScoreHtml
  setVisibility(elements.resultContainer, true)
}

/**
 * Function to set the visibility of an element.
 * @param {HTMLElement} element - The HTML element.
 * @param {boolean} isVisible - Whether the element should be visible.
 */
function setVisibility (element, isVisible) {
  element.style.display = isVisible ? 'block' : 'none'
}

/**
 * Function to handle the start button click.
 * @param {Event} event - The click event.
 */
function onStartButtonClick (event) {
  event.preventDefault()
  quizState.userName = document.getElementById('nickname').value.trim()
  if (quizState.userName) {
    startQuiz()
  } else {
    alert('Please enter your name.')
  }
}

/**
 * Async function to start the quiz.
 */
async function startQuiz () {
  setVisibility(elements.nameForm, false)
  setVisibility(elements.questionContainer, true)
  try {
    const response = await fetch(startUrl)
    if (!response.ok) throw new Error('Failed to fetch question.')
    const questionData = await response.json()
    quizState.userTimeStart = Date.now()
    displayQuestion(questionData)
  } catch (error) {
    console.error('Error:', error)
    alert('Error starting the quiz.')
  }
}

/**
 * Function to display a question.
 * @param {object} questionData - The question data.
 */
function displayQuestion (questionData) {
  console.log('Displaying question:', questionData)
  elements.questionElement.innerText = questionData.question

  if (questionData.alternatives) {
    // Handle multiple-choice question
    quizState.questionType = 'multiple-choice'
    displayMultipleChoice(questionData.alternatives)
    setVisibility(elements.answerInput, false) // Hide text input
  } else {
    // Handle text input question
    quizState.questionType = 'text'
    displayTextInput()
    setVisibility(elements.radioButtonsContainer, false) // Hide multiple-choice options
  }

  quizState.nextQuestionUrl = questionData.nextURL
  // Restart the timer for the new question
  startTimer()
}

/**
 * Function to display multiple-choice options.
 * @param {object} alternatives - The multiple-choice options.
 */
function displayMultipleChoice (alternatives) {
  console.log('Displaying multiple choice options:', alternatives)
  quizState.currentSelectedRadioIndex = -1
  elements.radioButtonsContainer.innerHTML = ''
  for (const [key, value] of Object.entries(alternatives)) {
    const radioButtonHtml = `<label><input type="radio" name="answer" value="${key}">${value}</label>`
    elements.radioButtonsContainer.insertAdjacentHTML('beforeend', radioButtonHtml)
  }
  setVisibility(elements.radioButtonsContainer, true)
}

/**
 * Function to display text input for an answer.
 */
function displayTextInput () {
  setVisibility(elements.radioButtonsContainer, false)
  setVisibility(elements.answerInput, true)
  elements.answerInput.focus()
}

/**
 * Function to start the timer.
 */
function startTimer () {
  clearInterval(quizState.progressTimer)

  let time = 10
  elements.timerDisplay.innerText = `Time left: ${time} seconds`

  quizState.progressTimer = setInterval(() => {
    time--
    if (time < 0) {
      clearInterval(quizState.progressTimer)
      gameOver("Time's up! Game Over.")
    } else {
      elements.timerDisplay.innerText = `Time left: ${time} seconds`
      updateProgressBar(time)
    }
  }, 1000)
}

/**
 * Function to update the progress bar.
 * @param {number} time - The remaining time.
 */
function updateProgressBar (time) {
  const totalTime = 10 // Total time for the question
  const percentage = (time / totalTime) * 100
  elements.progressBar.style.width = `${percentage}%`
  elements.progressBar.style.backgroundColor = time <= 2 ? 'red' : time <= 5 ? 'orange' : 'green'
}

/**
 * Function to handle submit button click.
 * @param {Event} event - The click event.
 */
async function onSubmitButtonClick (event) {
  event.preventDefault()
  const answer = quizState.questionType === 'text' ? elements.answerInput.value.trim() : getSelectedRadioValue()
  if (!answer) {
    gameOver('Please input an answer!')
    return
  }
  await submitAnswer(quizState.nextQuestionUrl, answer)
  if (quizState.questionType === 'text') {
    elements.answerInput.value = ''
  }
}

/**
 * Function to get the value of the selected radio button.
 * @returns {string} - The value of the selected radio button.
 */
function getSelectedRadioValue () {
  const selectedRadio = elements.radioButtonsContainer.querySelector('input[type="radio"]:checked')
  return selectedRadio ? selectedRadio.value : ''
}

/**
 * Function to submit an answer.
 * @param {string} url - The URL to submit the answer.
 * @param {string} answer - The answer to submit.
 */
async function submitAnswer (url, answer) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer })
    })
    const result = await response.json()
    if (!response.ok) {
      gameOver(result.message)
    } else {
      console.log('Server response:', result)
      handleAnswerResponse(result)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

/**
 * Game over function to hide elements and reset the timer
 * @param {string} message - Which message to display
 */
function gameOver (message) {
  clearInterval(quizState.progressTimer)
  elements.resultElement.innerHTML = message
  setVisibility(elements.questionContainer, false)
  setVisibility(elements.resultContainer, true)
}

/**
 * Function to handle the response after submitting an answer.
 * @param {object} result - The result data.
 */
function handleAnswerResponse (result) {
  if (result.nextURL) {
    fetchAndDisplayNextQuestion(result.nextURL)
  } else {
    console.log('Quiz ended, calling finishQuiz')
    finishQuiz(result.message)
  }
}

/**
 * Function to fetch and display the next question.
 * @param {string} url - The URL of the next question.
 */
async function fetchAndDisplayNextQuestion (url) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch next question.')
    const nextQuestionData = await response.json()
    displayQuestion(nextQuestionData)
  } catch (error) {
    console.error('Error:', error)
    alert('Error fetching the next question.')
  }
}

/**
 * Function to handle the quiz finish.
 * @param {string} message - The finish message.
 */
function finishQuiz (message) {
  console.log('Finishing quiz')
  const totalTime = (Date.now() - quizState.userTimeStart) / 1000 // Convert to seconds
  updateHighScores(quizState.userName, totalTime)
  clearInterval(quizState.progressTimer)
  elements.resultElement.innerHTML = `${message}<br>Your time: ${totalTime.toFixed(2)} seconds`
  setVisibility(elements.questionContainer, false)
  setVisibility(elements.resultContainer, true)
}

/**
 * Function to update high scores.
 * @param {string} name - The user's name.
 * @param {number} time - The user's quiz completion time in seconds.
 */
function updateHighScores (name, time) {
  console.log('Updating high scores for:', name, 'with time:', time)
  const newScore = { name, time }
  const savedScores = JSON.parse(localStorage.getItem('highScoreList')) || []
  const updatedScores = [...savedScores, newScore].sort((a, b) => a.time - b.time).slice(0, 10)
  console.log('Updated high scores:', updatedScores)
  localStorage.setItem('highScoreList', JSON.stringify(updatedScores))
  quizState.highScores = updatedScores
}

/**
 * Function to handle restart button click.
 * @param {Event} event - The click event.
 */
function onRestartButtonClick (event) {
  event.preventDefault()
  resetQuiz()
}

/**
 * Function to reset the quiz.
 */
function resetQuiz () {
  clearInterval(quizState.progressTimer)
  elements.progressBar.style.width = '100%'
  elements.nameForm.reset()
  setVisibility(elements.resultContainer, false)
  setVisibility(elements.nameForm, true)
}

export default { onRestartButtonClick, onStartButtonClick, onSubmitButtonClick, onViewHighScoresClick, setVisibility }
