let data = [];
let currentSentence = null;
let currentAnswers = [];
let options = [];
let currentIndex = 0;
let currentLang = "ru";

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 App starting...");

  // ✅ загрузка языка из localStorage
  const savedLang = localStorage.getItem("app_lang");
  if (savedLang) {
    currentLang = savedLang;
  }


  initLangButton();
  loadData();
});

const WORD_HEIGHT = 40;

const DEBUG = false;

function log(...args) {
  if (DEBUG) console.log(...args);
}
// ================= LANGUAGE =================
function initLangButton() {
  const btn = document.getElementById("langBtn");

  // установить текст сразу при загрузке
  btn.textContent = currentLang === "ru" ? "🌐 RU" : "🌐 UA";

  btn.onclick = () => {
    currentLang = currentLang === "ru" ? "ua" : "ru";

    // ✅ сохраняем язык
    localStorage.setItem("app_lang", currentLang);

    btn.textContent = currentLang === "ru" ? "🌐 RU" : "🌐 UA";

    console.log("🌐 Language:", currentLang);

    startRound();
  };
}

function spawnEmoji(btn, isCorrect) {
  const emoji = document.createElement("div");

  emoji.textContent = isCorrect ? "😊" : "😢";

  const rect = btn.getBoundingClientRect();

  const size = 25; // размер смайлика

  emoji.style.position = "absolute";
  emoji.style.left = rect.left + window.scrollX + rect.width / 2 + "px";
  emoji.style.top = rect.top + window.scrollY + rect.height / 2 + "px";

  emoji.style.fontSize = size + "px";
  emoji.style.opacity = "0.8";
  emoji.style.pointerEvents = "none";
  emoji.style.zIndex = "9999";

  // центрируем сам смайлик относительно точки
  emoji.style.transform = "translate(-50%, -50%)";

  emoji.style.transition = "all 0.5s ease";

  document.body.appendChild(emoji);

  requestAnimationFrame(() => {
    emoji.style.transform = "translate(-50%, -200%)"; // улетает вверх от центра
    emoji.style.opacity = "0";
  });

  setTimeout(() => {
    emoji.remove();
  }, 700);
}

// ================= LOAD JSON =================
async function loadData() {
  console.log("🚀 Loading JSON...");

  try {
    let res = await fetch("./sentences.json");

    if (!res.ok) throw new Error("Local failed");

    data = await res.json();

    console.log("✅ Local JSON loaded");
  } catch (e) {
    console.warn("❌ Local failed, trying GitHub");

    let res = await fetch("YOUR_GITHUB_RAW_JSON_URL");
    data = await res.json();

    console.log("✅ GitHub JSON loaded");
  }

  console.log("📊 Total sentences:", data.length);

  startRound();
}

// ================= START ROUND =================
function startRound() {
  console.log("🎮 Starting round...");

  let allWords = [];

  data.forEach(sentence => {
    sentence.answers.forEach(a => {
      allWords.push(a);
    });
  });

  allWords = shuffle(allWords);

  currentAnswers = allWords.slice(0, 3);
  currentIndex = 0;

  isAnimating = false; // 🔥 ВАЖНО — сброс блокировки

  console.log("📖 New random round:", currentAnswers);

  prepareOptions();
  showWord();
  renderOptions();

  const box = document.getElementById("wordBox");

  // сброс анимации контейнера
  box.style.transition = "none";
  box.style.transform = "translateY(-40px)";
  box.offsetHeight; // reflow

  renderWordReel();
}

// ================= SHOW WORD =================
function showWord() {
  renderWordReel();
}

// ================= PREPARE OPTIONS =================
function prepareOptions() {
  const correctWords = currentAnswers.map(a => a.word[currentLang]);

  // пул всех слов из всего JSON
  let allWords = [];

  data.forEach(sentence => {
    sentence.answers.forEach(a => {
      allWords.push(a.word[currentLang]);
    });
  });

  // удаляем дубликаты
  allWords = [...new Set(allWords)];

  // убираем правильные слова, чтобы не было повторов
  const filteredPool = allWords.filter(w => !correctWords.includes(w));

  // перемешиваем
  const shuffled = shuffle(filteredPool);

  // берем случайные неправильные + добавляем правильные
  const randomWrong = shuffled.slice(0, 9 - correctWords.length);

  options = shuffle([...correctWords, ...randomWrong]).slice(0, 9);

  console.log("🧩 Global options:", options);
}

function adjustFontSize(btn, text) {
  const length = text.length;

  if (length <= 8) {
    btn.style.fontSize = "15px"; // как сейчас
  } else if (length <= 10) {
    btn.style.fontSize = "14px"; // на 1 меньше
  } else {
    btn.style.fontSize = "13px"; // на 2 меньше
  }
}

function addPressEffect(btn) {
  btn.addEventListener("mousedown", () => {
    btn.style.transform = "scale(0.95)";
  });

  btn.addEventListener("mouseup", () => {
    btn.style.transform = "scale(1)";
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "scale(1)";
  });

  btn.addEventListener("touchstart", () => {
    btn.style.transform = "scale(0.95)";
  });

  btn.addEventListener("touchend", () => {
    btn.style.transform = "scale(1)";
  });
}


// ================= RENDER =================
function renderOptions() {
  const container = document.getElementById("options");
  container.innerHTML = "";

  options.forEach(word => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = word;
  adjustFontSize(btn, word); // ✅ применяем размер
  
  addPressEffect(btn); // ✅ эффект нажатия

    btn.disabled = false; // ✅ важно

    btn.onclick = () => {
      checkAnswer(word, btn);
    };

    container.appendChild(btn);
  });
}
const infoTextRU = `
📘 Игра: WordCraft

🎯 Цель:
Выбери правильный перевод слова из предложенных вариантов.

🕹 Как играть:
• Сверху показывается слово  
• Ниже — 9 вариантов ответа  
• Нажми на правильный перевод  

✅ Правильный ответ подсветится зелёным 😊  
❌ Неправильный — красным 😢  

🔄 Раунд:
• После ответа открывается новое слово  
• Когда слова заканчиваются — начинается новый раунд  

💡 Подсказка:
• В каждом раунде может быть до 3 слов  
• Выбирай внимательно!

Удачи 🚀
`;

const infoTextUA = `
📘 Гра: WordCraft

🎯 Мета:
Обери правильний переклад слова серед варіантів.

🕹 Як грати:
• Зверху показується слово  
• Нижче — 9 варіантів відповіді  
• Натисни на правильний переклад  

✅ Правильна відповідь підсвітиться зеленим 😊  
❌ Неправильна — червоним 😢  

🔄 Раунд:
• Після відповіді з'являється нове слово  
• Коли слова закінчуються — починається новий раунд  

💡 Підказка:
• У кожному раунді може бути до 3 слів  
• Уважно обирай!

Успіхів 🚀
`;

// открыть инфо
function showInfo() {
  const modal = document.getElementById("infoModal");
  const text = document.getElementById("infoText");

  text.textContent = currentLang === "ru" ? infoTextRU : infoTextUA;

  modal.style.display = "block";
}

// закрыть инфо
function hideInfo() {
  document.getElementById("infoModal").style.display = "none";
}

// привязка кнопок
document.addEventListener("DOMContentLoaded", () => {
  const infoBtn = document.getElementById("infoBtn");
  const closeBtn = document.getElementById("closeInfoBtn");

  if (infoBtn) infoBtn.onclick = showInfo;
  if (closeBtn) closeBtn.onclick = hideInfo;
});

function useHelp() {
  const item = currentAnswers[currentIndex];
  const correctWord = item.word[currentLang].trim().toLowerCase();

  const buttons = document.querySelectorAll(".option-btn");

  buttons.forEach(btn => {
    const btnWord = btn.textContent.trim().toLowerCase();

    if (btnWord === correctWord) {
      // имитируем правильный клик
      checkAnswer(btn.textContent, btn);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const helpBtn = document.getElementById("helpBtn");

  if (helpBtn) {
    helpBtn.onclick = useHelp;
  }
});



// ================= CHECK =================
let isAnimating = false;

function checkAnswer(selectedWord, btn) {
  if (isAnimating) return;

  const item = currentAnswers[currentIndex];
  const correctWord = String(item.word[currentLang]).trim().toLowerCase();
  const selected = String(selectedWord).trim().toLowerCase();

  console.log("👉 Selected:", selected);
  console.log("🎯 Correct:", correctWord);

  if (selected === correctWord) {
    console.log("✅ CORRECT");

    isAnimating = true;

    spawnEmoji(btn, true);
    btn.classList.add("correct");

    document.querySelectorAll(".option-btn").forEach(b => b.disabled = true);

    // 👉 сначала анимация кнопки + смайлик
    setTimeout(() => {
      nextWord(); // прокрутка слова
    }, 300);

  } else {
    console.log("❌ WRONG");

    btn.classList.remove("wrong");
    btn.classList.add("wrong");

    spawnEmoji(btn, false);

    setTimeout(() => {
      btn.classList.remove("wrong");
    }, 400);
  }
}

// ================= NEXT =================
function nextWord() {
  const box = document.getElementById("wordBox");

  box.style.transition = "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)";
  box.style.transform = "translateY(-80px)";

  setTimeout(() => {
    currentIndex++;

    // ✅ ЕСЛИ СЛОВА ЗАКОНЧИЛИСЬ → НОВЫЙ РАУНД
    if (currentIndex >= currentAnswers.length) {
      console.log("🏁 Round ended");

      startRound(); // 🔥 запускаем новый раунд
      return;
    }

    renderWordReel();

    document.querySelectorAll(".option-btn").forEach(b => {
  b.disabled = false;
  b.classList.remove("wrong"); // ❗ correct НЕ трогаем
});

    isAnimating = false;

  }, 450);
}

// ================= SHUFFLE =================
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function renderWordReel() {
  const box = document.getElementById("wordBox");

  const prev = currentAnswers[currentIndex - 1];
  const current = currentAnswers[currentIndex];
  const next = currentAnswers[currentIndex + 1];

  if (!current) return;

  box.innerHTML = `
    <div class="word-item ${prev ? "prev" : ""}">
      ${prev ? prev.correct : ""}
    </div>

    <div class="word-item active">
      ${current.correct}
    </div>

    <div class="word-item ${next ? "next" : ""}">
      ${next ? next.correct : ""}
    </div>
  `;

  // центрируем
  box.style.transition = "none";
  box.style.transform = "translateY(-40px)";
}