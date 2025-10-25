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

// Statistik-Daten aus localStorage laden
let countryStats = JSON.parse(localStorage.getItem('countryStats')) || {};
let enabledCountries = JSON.parse(localStorage.getItem('enabledCountries')) || {};

// Initialisiere enabledCountries, falls leer
if (Object.keys(enabledCountries).length === 0) {
  countries.forEach(c => {
    enabledCountries[c.name] = true;
  });
}

const startBtn = document.getElementById("startBtn");
const settingsBtn = document.getElementById("settingsBtn");
const statsBtn = document.getElementById("statsBtn");
const timelimitInput = document.getElementById("timelimit");
const gameDiv = document.getElementById("game");
const scoreDiv = document.getElementById("score");
const timerDiv = document.getElementById("timer");
const countryDiv = document.getElementById("country");
const countryStatsDiv = document.getElementById("countryStats");
const answerInput = document.getElementById("answer");
const submitBtn = document.getElementById("submitBtn");
const tipBtn = document.getElementById("tipBtn");
const tipDiv = document.getElementById("tip");
const feedbackDiv = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const endBtn = document.getElementById("endBtn");
const resultDiv = document.getElementById("result");

// Modal-Elemente
const settingsModal = document.getElementById("settingsModal");
const statsModal = document.getElementById("statsModal");
const closeBtn = document.querySelector(".close");
const closeStatsBtn = document.querySelector(".close-stats");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const continentSettingsDiv = document.getElementById("continentSettings");
const topCountInput = document.getElementById("topCount");
const topCorrectDiv = document.getElementById("topCorrect");
const topWrongDiv = document.getElementById("topWrong");

timelimitInput.addEventListener("change", () => {
  let val = parseInt(timelimitInput.value);
  if (isNaN(val) || val < 5) val = 5;
  if (val > 120) val = 120;
  timelimitInput.value = val;
  timeLimit = val;
});

// Settings Button
settingsBtn.onclick = function() {
  showSettingsModal();
};

closeBtn.onclick = function() {
  settingsModal.classList.add("hide");
};

saveSettingsBtn.onclick = function() {
  saveSettings();
  settingsModal.classList.add("hide");
};

// Statistics Button
statsBtn.onclick = function() {
  showStatsModal();
};

closeStatsBtn.onclick = function() {
  statsModal.classList.add("hide");
};

topCountInput.addEventListener("change", () => {
  updateStatsDisplay();
});

// Klick außerhalb des Modals schließt es
window.onclick = function(event) {
  if (event.target == settingsModal) {
    settingsModal.classList.add("hide");
  }
  if (event.target == statsModal) {
    statsModal.classList.add("hide");
  }
};

function showSettingsModal() {
  // Gruppiere Länder nach Kontinent
  const continents = {};
  countries.forEach(c => {
    if (!continents[c.continent]) {
      continents[c.continent] = [];
    }
    continents[c.continent].push(c);
  });

  let html = '';
  Object.keys(continents).sort().forEach(continent => {
    html += `<div class="continent-section">
      <h3>
        <input type="checkbox" id="continent-${continent}" class="continent-checkbox" data-continent="${continent}">
        <label for="continent-${continent}">${continent}</label>
      </h3>
      <div class="country-list" id="countries-${continent}">`;
    
    continents[continent].forEach(country => {
      const checked = enabledCountries[country.name] ? 'checked' : '';
      html += `<label class="country-checkbox">
        <input type="checkbox" name="country" value="${country.name}" ${checked}>
        ${country.flag} ${country.name}
      </label>`;
    });
    
    html += `</div></div>`;
  });

  continentSettingsDiv.innerHTML = html;

  // Event-Listener für Kontinent-Checkboxen
  document.querySelectorAll('.continent-checkbox').forEach(cb => {
    const continent = cb.dataset.continent;
    updateContinentCheckbox(continent);
    
    cb.addEventListener('change', function() {
      const countryCheckboxes = document.querySelectorAll(`#countries-${continent} input[type="checkbox"]`);
      countryCheckboxes.forEach(ccb => {
        ccb.checked = this.checked;
      });
    });
  });

  // Event-Listener für einzelne Länder-Checkboxen
  document.querySelectorAll('.country-list input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', function() {
      const continent = this.closest('.continent-section').querySelector('.continent-checkbox').dataset.continent;
      updateContinentCheckbox(continent);
    });
  });
}

function updateContinentCheckbox(continent) {
  const continentCb = document.getElementById(`continent-${continent}`);
  const countryCheckboxes = document.querySelectorAll(`#countries-${continent} input[type="checkbox"]`);
  const checkedCount = Array.from(countryCheckboxes).filter(cb => cb.checked).length;
  
  if (checkedCount === 0) {
    continentCb.checked = false;
    continentCb.indeterminate = false;
  } else if (checkedCount === countryCheckboxes.length) {
    continentCb.checked = true;
    continentCb.indeterminate = false;
  } else {
    continentCb.checked = false;
    continentCb.indeterminate = true;
  }
}

function saveSettings() {
  const checkboxes = document.querySelectorAll('input[name="country"]');
  checkboxes.forEach(cb => {
    enabledCountries[cb.value] = cb.checked;
  });
  localStorage.setItem('enabledCountries', JSON.stringify(enabledCountries));
  alert('Einstellungen gespeichert!');
}

function showStatsModal() {
  statsModal.classList.remove("hide");
  updateStatsDisplay();
}

function updateStatsDisplay() {
  const topCount = parseInt(topCountInput.value) || 10;
  
  // Berechne Statistiken
  const statsArray = [];
  countries.forEach(country => {
    const stats = countryStats[country.name] || { correct: 0, wrong: 0 };
    const total = stats.correct + stats.wrong;
    statsArray.push({
      name: country.name,
      flag: country.flag,
      correct: stats.correct,
      wrong: stats.wrong,
      total: total
    });
  });

  // Top richtig
  const topCorrect = statsArray
    .filter(s => s.correct > 0)
    .sort((a, b) => b.correct - a.correct)
    .slice(0, topCount);

  // Top falsch
  const topWrong = statsArray
    .filter(s => s.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong)
    .slice(0, topCount);

  // Anzeige Top richtig
  if (topCorrect.length === 0) {
    topCorrectDiv.innerHTML = '<p style="color: #888;">Noch keine Daten vorhanden</p>';
  } else {
    let html = '<div class="stats-list">';
    const maxCorrect = topCorrect[0].correct;
    topCorrect.forEach((item, index) => {
      const percentage = (item.correct / maxCorrect) * 100;
      html += `<div class="stat-item">
        <div class="stat-rank">#${index + 1}</div>
        <div class="stat-info">
          <div class="stat-name">${item.flag} ${item.name}</div>
          <div class="stat-bar-container">
            <div class="stat-bar stat-bar-correct" style="width: ${percentage}%"></div>
          </div>
          <div class="stat-count">${item.correct} richtig</div>
        </div>
      </div>`;
    });
    html += '</div>';
    topCorrectDiv.innerHTML = html;
  }

  // Anzeige Top falsch
  if (topWrong.length === 0) {
    topWrongDiv.innerHTML = '<p style="color: #888;">Noch keine Daten vorhanden</p>';
  } else {
    let html = '<div class="stats-list">';
    const maxWrong = topWrong[0].wrong;
    topWrong.forEach((item, index) => {
      const percentage = (item.wrong / maxWrong) * 100;
      html += `<div class="stat-item">
        <div class="stat-rank">#${index + 1}</div>
        <div class="stat-info">
          <div class="stat-name">${item.flag} ${item.name}</div>
          <div class="stat-bar-container">
            <div class="stat-bar stat-bar-wrong" style="width: ${percentage}%"></div>
          </div>
          <div class="stat-count">${item.wrong} falsch</div>
        </div>
      </div>`;
    });
    html += '</div>';
    topWrongDiv.innerHTML = html;
  }
}

function shuffleArray(array) {
  // Fisher-Yates Shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

startBtn.onclick = function() {
  // Filtere nur aktivierte Länder
  const activeCountries = countries.filter(c => enabledCountries[c.name]);
  
  if (activeCountries.length === 0) {
    alert('Bitte wähle mindestens ein Land in den Einstellungen aus!');
    return;
  }

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
  
  // Nur aktivierte Länder verwenden
  maxQuestions = activeCountries.length;
  activeCountries.forEach((c, i) => c._idx = i);
  shuffleArray(activeCountries);
  
  // Temporäre Liste für das Spiel
  window.gameCountries = activeCountries;
  
  askQuestion();
};

function askQuestion() {
  if (questionCount >= maxQuestions) {
    endGame();
    return;
  }
  currentCountry = window.gameCountries[questionCount];
  tipState = 0;
  scoreDiv.textContent = `Punktestand: ${score} / ${questionCount}`;
  countryDiv.innerHTML = `${currentCountry.flag} <b>${currentCountry.name}</b><br><span style="font-size:0.9em;color:#78d1c8;">(${currentCountry.continent})</span>`;
  
  // Zeige Statistik für aktuelles Land
  const stats = countryStats[currentCountry.name] || { correct: 0, wrong: 0 };
  countryStatsDiv.innerHTML = `<span style="color: #97e47c;">✓ ${stats.correct}</span> | <span style="color: #ff6b6b;">✗ ${stats.wrong}</span>`;
  
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
    tipDiv.textContent = `Anzahl Buchstaben: ${capital.length}`;
  } else if (tipState === 2) {
    tipDiv.textContent = `Erster Buchstabe: ${capital[0]}`;
  } else if (tipState === 3) {
    // Zeige Vokale (ohne Reihenfolge)
    let vowels = capital.match(/[aeiouäöüAEIOUÄÖÜ]/g);
    vowels = vowels ? [...new Set(vowels)].join(", ") : "Keine Vokale";
    tipDiv.textContent = `Vokale enthalten: ${vowels}`;
  } else if (tipState === 4) {
    tipDiv.textContent = `Die Hauptstadt beginnt mit "${capital.slice(0,2)}..."`;
  } else if (tipState === 5) {
    // Zeige zweiten Buchstaben
    tipDiv.textContent = `Zweiter Buchstabe: ${capital[1]}`;
  } else if (tipState === 6) {
    // Zeige letzten Buchstaben
    tipDiv.textContent = `Letzter Buchstabe: ${capital[capital.length - 1]}`;
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
  // Aktualisiere Statistik
  if (!countryStats[currentCountry.name]) {
    countryStats[currentCountry.name] = { correct: 0, wrong: 0 };
  }
  
  if (correct) {
    countryStats[currentCountry.name].correct++;
    feedbackDiv.innerHTML = `<span style="color:#97e47c">Richtig! ${currentCountry.capital} ist die Hauptstadt von ${currentCountry.name}.</span>`;
    score++;
  } else if (timeout) {
    countryStats[currentCountry.name].wrong++;
    feedbackDiv.innerHTML = `<span style="color:#ffb86c">Zeit abgelaufen! Die Hauptstadt von ${currentCountry.name} ist <b>${currentCountry.capital}</b>.</span>`;
  } else {
    countryStats[currentCountry.name].wrong++;
    feedbackDiv.innerHTML = `<span style="color:#ff6b6b">Leider falsch. Die Hauptstadt von ${currentCountry.name} ist <b>${currentCountry.capital}</b>.</span>`;
  }
  
  // Speichere Statistik in localStorage
  localStorage.setItem('countryStats', JSON.stringify(countryStats));
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