let timeLimit = 20;
let timer;
let timeLeft;
let currentCountry;
let usedIndices = [];
let score = 0;
let questionCount = 0;
let maxQuestions = countries.length;
let tipState = 0;
let gameActive = false;

const startBtn = document.getElementById("startBtn");
const timelimitInput = document.getElementById("timelimit");
const gameDiv = document.getElementById("game");
const scoreDiv = document.getElementById("score");
const timerDiv = document.getElementById("timer");
const countryDiv = document.getElementById("country");
const answerInput = document.getElementById("answer");
const submitBtn = document.getElementById("submitBtn");
const tipBtn = document.getElementById("tipBtn");
const tipDiv = document.getElementById("tip");
const feedbackDiv = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const endBtn = document.getElementById("endBtn");
const resultDiv = document.getElementById("result");

timelimitInput.addEventListener("change", () => {
  let val = parseInt(timelimitInput.value);
  if (isNaN(val) || val < 5) val = 5;
  if (val > 120) val = 120;
  timelimitInput.value = val;
  timeLimit = val;
});

function shuffleArray(array) {
  // Fisher-Yates Shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

startBtn.onclick = function() {
  score = 0;
  questionCount = 0;
  usedIndices = [];
  tipState = 0;
  gameActive = true;
  gameDiv.classList.remove("hide");
  resultDiv.classList.add("hide");
  startBtn.disabled = true;
  endBtn.classList.remove("hide");
  nextBtn.classList.add("hide");
  feedbackDiv.textContent = "";
  answerInput.value = "";
  tipDiv.textContent = "";
  countries.forEach((c, i) => c._idx = i); // Index for reference
  shuffleArray(countries);
  askQuestion();
};

function askQuestion() {
  if (questionCount >= maxQuestions) {
    endGame();
    return;
  }
  currentCountry = countries[questionCount];
  tipState = 0;
  scoreDiv.textContent = `Punktestand: ${score} / ${questionCount}`;
  countryDiv.innerHTML = `${currentCountry.flag} <b>${currentCountry.name}</b><br><span style="font-size:0.9em;color:#78d1c8;">(${currentCountry.continent})</span>`;
  feedbackDiv.textContent = "";
  answerInput.value = "";
  answerInput.disabled = false;
  submitBtn.disabled = false;
  tipBtn.disabled = false;
  nextBtn.classList.add("hide");
  tipDiv.textContent = "";
  answerInput.focus();
  timeLeft = timeLimit;
  timerDiv.textContent = `Zeit: ${timeLeft}s`;
  clearInterval(timer);
  timer = setInterval(countdown, 1000);
}

function countdown() {
  timeLeft--;
  timerDiv.textContent = `Zeit: ${timeLeft}s`;
  if (timeLeft <= 0) {
    clearInterval(timer);
    showFeedback(false, true);
  }
}

submitBtn.onclick = function() {
  if (!gameActive) return;
  clearInterval(timer);
  checkAnswer();
};

answerInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter" && !submitBtn.disabled) {
    submitBtn.click();
  }
});

tipBtn.onclick = function() {
  if (!gameActive) return;
  tipState++;
  let capital = currentCountry.capital;
  if (tipState === 1) {
    tipDiv.textContent = `Erster Buchstabe: ${capital[0]}`;
  } else if (tipState === 2) {
    tipDiv.textContent = `Anzahl Buchstaben: ${capital.length}`;
  } else if (tipState === 3) {
    // Zeige Vokale (ohne Reihenfolge)
    let vowels = capital.match(/[aeiouäöüAEIOUÄÖÜ]/g);
    vowels = vowels ? [...new Set(vowels)].join(", ") : "Keine Vokale";
    tipDiv.textContent = `Vokale enthalten: ${vowels}`;
  } else if (tipState === 4) {
    tipDiv.textContent = `Die Hauptstadt beginnt mit "${capital.slice(0,2)}..."`;
    tipBtn.disabled = true;
  }
};

function checkAnswer() {
  let userAnswer = answerInput.value.trim().toLowerCase();
  let correctAnswer = currentCountry.capital.trim().toLowerCase();
  answerInput.disabled = true;
  submitBtn.disabled = true;
  tipBtn.disabled = true;
  let correct = userAnswer === correctAnswer;
  showFeedback(correct, false);
  nextBtn.classList.remove("hide");
}

function showFeedback(correct, timeout) {
  if (correct) {
    feedbackDiv.innerHTML = `<span style="color:#97e47c">Richtig! ${currentCountry.capital} ist die Hauptstadt von ${currentCountry.name}.</span>`;
    score++;
  } else if (timeout) {
    feedbackDiv.innerHTML = `<span style="color:#ffb86c">Zeit abgelaufen! Die Hauptstadt von ${currentCountry.name} ist <b>${currentCountry.capital}</b>.</span>`;
  } else {
    feedbackDiv.innerHTML = `<span style="color:#ff6b6b">Leider falsch. Die Hauptstadt von ${currentCountry.name} ist <b>${currentCountry.capital}</b>.</span>`;
  }
}

nextBtn.onclick = function() {
  questionCount++;
  askQuestion();
};

endBtn.onclick = function() {
  endGame();
};

function endGame() {
  clearInterval(timer);
  gameActive = false;
  gameDiv.classList.add("hide");
  startBtn.disabled = false;
  nextBtn.classList.add("hide");
  endBtn.classList.add("hide");
  let percent = Math.round((score / maxQuestions) * 100);
  resultDiv.classList.remove("hide");
  resultDiv.innerHTML = `
    <h2>Spiel beendet!</h2>
    <p>Du hast <b>${score}</b> von <b>${maxQuestions}</b> Hauptstädten richtig erraten (${percent}%).</p>
    <button onclick="location.reload()">Nochmal spielen</button>
  `;
}