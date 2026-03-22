/**
 * タイピングアドベンチャー — ゲームロジック（DOM・イベント）
 *
 * 純粋関数・データは js/logic.js で定義されている。
 * このファイルより前に logic.js を読み込むこと。
 *
 * 対象: コンピューター初学者の小中学生
 * 目標: ローマ字入力を楽しく練習できること
 */

'use strict';

// ===================================================
// 状態
// ===================================================
const state = {
  level: 1,
  score: 0,
  combo: 0,
  maxCombo: 0,
  correctCount: 0,
  totalAttempts: 0,
  timeLeft: CONFIG.TIME_LIMIT,
  timerInterval: null,
  currentWord: null,
  usedWords: new Set(),
  running: false,
};

// ===================================================
// DOM 参照
// ===================================================
const $ = id => document.getElementById(id);
const screens = {
  title:  $('screen-title'),
  howto:  $('screen-howto'),
  game:   $('screen-game'),
  result: $('screen-result'),
};

// ===================================================
// 画面切替
// ===================================================
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ===================================================
// タイトル画面
// ===================================================
document.querySelectorAll('.btn-level').forEach(btn => {
  btn.addEventListener('click', () => {
    state.level = parseInt(btn.dataset.level, 10);
    startGame();
  });
});

$('btn-howto').addEventListener('click', () => showScreen('howto'));
$('btn-howto-back').addEventListener('click', () => showScreen('title'));
$('btn-retry').addEventListener('click', () => startGame());
$('btn-home').addEventListener('click', () => showScreen('title'));

// ===================================================
// ゲーム開始
// ===================================================
function startGame() {
  state.score = 0;
  state.combo = 0;
  state.maxCombo = 0;
  state.correctCount = 0;
  state.totalAttempts = 0;
  state.timeLeft = CONFIG.TIME_LIMIT;
  state.usedWords = new Set();
  state.running = true;

  updateScoreDisplay();
  updateComboDisplay();
  $('feedback-area').textContent = '';
  $('typing-input').value = '';
  $('typing-input').className = 'typing-input';

  showScreen('game');
  $('typing-input').focus();

  nextWord();
  startTimer();
}

// ===================================================
// 次の問題
// ===================================================
function nextWord() {
  const pool = WORD_DB[state.level];
  const available = pool.filter(w => !state.usedWords.has(w.kana));

  if (available.length === 0) {
    state.usedWords.clear();
    return nextWord();
  }

  const word = available[Math.floor(Math.random() * available.length)];
  state.usedWords.add(word.kana);
  state.currentWord = { ...word, romaji: kanaToRomaji(word.kana) };

  $('word-emoji').textContent = word.emoji;
  $('word-kana').textContent = word.kana;
  $('typing-input').value = '';
  $('typing-input').className = 'typing-input';
  updateRomajiHint('');
  $('feedback-area').textContent = '';
}

// ===================================================
// ローマ字ヒント表示（入力済みをハイライト）
// ===================================================
function updateRomajiHint(typed) {
  const romaji = state.currentWord.romaji;
  let html = '';
  for (let i = 0; i < romaji.length; i++) {
    if (i < typed.length) {
      html += `<span class="char-typed">${romaji[i]}</span>`;
    } else if (i === typed.length) {
      html += `<span class="char-cursor">${romaji[i]}</span>`;
    } else {
      html += `<span class="char-rest">${romaji[i]}</span>`;
    }
  }
  $('word-remaining').innerHTML = html;
  $('word-typed').textContent = typed;
}

// ===================================================
// 入力処理
// ===================================================
$('typing-input').addEventListener('input', e => {
  if (!state.running) return;

  const typed = e.target.value.toLowerCase().trim();
  const romaji = state.currentWord.romaji;

  updateRomajiHint(typed);

  if (typed === romaji) {
    onCorrect();
  } else if (!romaji.startsWith(typed)) {
    onWrong();
  }
});

// IME確定対策
let isComposing = false;
$('typing-input').addEventListener('compositionstart', () => { isComposing = true; });
$('typing-input').addEventListener('compositionend', e => {
  isComposing = false;
  e.target.dispatchEvent(new Event('input'));
});

// ===================================================
// 正解処理
// ===================================================
function onCorrect() {
  state.correctCount++;
  state.totalAttempts++;
  state.combo++;
  if (state.combo > state.maxCombo) state.maxCombo = state.combo;

  const gained = calcGainedScore(state.combo);
  state.score += gained;

  updateScoreDisplay();
  updateComboDisplay(true);

  const card = $('word-card');
  card.classList.remove('correct', 'wrong');
  void card.offsetWidth;
  card.classList.add('correct');

  $('typing-input').classList.add('input-correct');

  const msgs = ['すごい！', 'せいかい！', 'かんぺき！', 'やった！', 'すばらしい！'];
  $('feedback-area').textContent = msgs[Math.floor(Math.random() * msgs.length)];
  $('feedback-area').style.color = '#4caf50';

  showScorePopup(`+${gained}`, '#f5a623');
  spawnParticles(8, '#4caf50');

  setTimeout(() => nextWord(), 300);
}

// ===================================================
// ミス処理
// ===================================================
function onWrong() {
  state.totalAttempts++;
  state.combo = 0;
  updateComboDisplay(false);

  const card = $('word-card');
  card.classList.remove('correct', 'wrong');
  void card.offsetWidth;
  card.classList.add('wrong');

  $('typing-input').classList.remove('input-correct');
  $('typing-input').classList.add('input-wrong');
  setTimeout(() => $('typing-input').classList.remove('input-wrong'), 300);

  $('feedback-area').textContent = 'もういちど！';
  $('feedback-area').style.color = '#e94560';

  $('typing-input').value = '';
  updateRomajiHint('');
}

// ===================================================
// スコア表示更新
// ===================================================
function updateScoreDisplay() {
  $('score-display').textContent = state.score;
}

function updateComboDisplay(pop) {
  $('combo-display').textContent = state.combo;
  if (pop && state.combo >= 2) {
    const area = document.querySelector('.header-combo');
    area.classList.remove('combo-pop');
    void area.offsetWidth;
    area.classList.add('combo-pop');
  }
}

// ===================================================
// タイマー
// ===================================================
function startTimer() {
  clearInterval(state.timerInterval);
  updateTimerDisplay();

  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    updateTimerDisplay();
    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      endGame();
    }
  }, 1000);
}

function updateTimerDisplay() {
  $('timer-display').textContent = state.timeLeft;
  $('timer-display').classList.toggle('urgent', state.timeLeft <= 10);

  const pct = (state.timeLeft / CONFIG.TIME_LIMIT) * 100;
  $('timer-bar').style.width = `${pct}%`;

  if (pct <= 30) {
    $('timer-bar').style.background = 'linear-gradient(90deg,#e94560,#ff6b6b)';
  } else {
    $('timer-bar').style.background = 'linear-gradient(90deg, #e94560, #f5a623)';
  }
}

// ===================================================
// ゲーム終了
// ===================================================
function endGame() {
  state.running = false;
  clearInterval(state.timerInterval);

  const accuracy = state.totalAttempts > 0
    ? Math.round((state.correctCount / state.totalAttempts) * 100)
    : 0;

  $('result-score').textContent = state.score;
  $('result-correct').textContent = state.correctCount;
  $('result-max-combo').textContent = state.maxCombo;
  $('result-accuracy').textContent = accuracy;

  const grade = getGrade(state.score, accuracy);
  $('result-grade').textContent = grade.text;
  $('result-grade').style.color = grade.color;
  $('result-mascot').textContent = grade.mascot;
  $('result-title').textContent = grade.title;

  showScreen('result');
  spawnParticles(20, '#f5a623');
}

// ===================================================
// エフェクト — スコアポップアップ
// ===================================================
function showScorePopup(text, color) {
  const el = document.createElement('div');
  el.className = 'score-popup';
  el.textContent = text;
  el.style.color = color;

  const card = $('word-card').getBoundingClientRect();
  el.style.left = `${card.left + card.width / 2}px`;
  el.style.top  = `${card.top}px`;

  $('effect-layer').appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// ===================================================
// エフェクト — パーティクル
// ===================================================
const PARTICLE_COLORS = ['#f5a623', '#e94560', '#4caf50', '#2196f3', '#ab47bc', '#fff176'];

function spawnParticles(count, baseColor) {
  const layer = $('effect-layer');
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    const size = 8 + Math.random() * 10;
    el.style.width  = `${size}px`;
    el.style.height = `${size}px`;
    el.style.background = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    el.style.left = `${10 + Math.random() * 80}vw`;
    el.style.top  = `${20 + Math.random() * 60}vh`;
    el.style.animationDelay    = `${Math.random() * 0.3}s`;
    el.style.animationDuration = `${0.7 + Math.random() * 0.6}s`;
    layer.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// ===================================================
// キーボードショートカット
// ===================================================
document.addEventListener('keydown', e => {
  if (screens.game.classList.contains('active') && e.key === 'Enter') {
    $('typing-input').focus();
  }
});

// ===================================================
// 初期表示
// ===================================================
showScreen('title');
