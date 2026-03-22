/**
 * タイピングアドベンチャー — ゲームロジック
 *
 * 対象: コンピューター初学者の小中学生
 * 目標: ローマ字入力を楽しく練習できること
 */

'use strict';

// ===================================================
// ローマ字変換テーブル
// ひらがな → ローマ字（複数の入力パターンに対応）
// ===================================================
const ROMAJI_TABLE = {
  'あ':'a',  'い':'i',  'う':'u',  'え':'e',  'お':'o',
  'か':'ka', 'き':'ki', 'く':'ku', 'け':'ke', 'こ':'ko',
  'さ':'sa', 'し':'si', 'す':'su', 'せ':'se', 'そ':'so',
  'た':'ta', 'ち':'ti', 'つ':'tu', 'て':'te', 'と':'to',
  'な':'na', 'に':'ni', 'ぬ':'nu', 'ね':'ne', 'の':'no',
  'は':'ha', 'ひ':'hi', 'ふ':'fu', 'へ':'he', 'ほ':'ho',
  'ま':'ma', 'み':'mi', 'む':'mu', 'め':'me', 'も':'mo',
  'や':'ya',            'ゆ':'yu',            'よ':'yo',
  'ら':'ra', 'り':'ri', 'る':'ru', 'れ':'re', 'ろ':'ro',
  'わ':'wa',                                  'を':'wo',
  'ん':'n',
  'が':'ga', 'ぎ':'gi', 'ぐ':'gu', 'げ':'ge', 'ご':'go',
  'ざ':'za', 'じ':'zi', 'ず':'zu', 'ぜ':'ze', 'ぞ':'zo',
  'だ':'da', 'ぢ':'di', 'づ':'du', 'で':'de', 'ど':'do',
  'ば':'ba', 'び':'bi', 'ぶ':'bu', 'べ':'be', 'ぼ':'bo',
  'ぱ':'pa', 'ぴ':'pi', 'ぷ':'pu', 'ぺ':'pe', 'ぽ':'po',
  // 拗音
  'きゃ':'kya','きゅ':'kyu','きょ':'kyo',
  'しゃ':'sha','しゅ':'shu','しょ':'sho',
  'ちゃ':'cha','ちゅ':'chu','ちょ':'cho',
  'にゃ':'nya','にゅ':'nyu','にょ':'nyo',
  'ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo',
  'みゃ':'mya','みゅ':'myu','みょ':'myo',
  'りゃ':'rya','りゅ':'ryu','りょ':'ryo',
  'ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
  'じゃ':'ja', 'じゅ':'ju', 'じょ':'jo',
  'びゃ':'bya','びゅ':'byu','びょ':'byo',
  'ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
};

// 許容する入力の揺れ（複数ローマ字を許容）
const ROMAJI_ALT = {
  'し':['si','shi'], 'ち':['ti','chi'], 'つ':['tu','tsu'],
  'ふ':['fu','hu'],  'じ':['zi','ji'],
  'しゃ':['sha','sya'], 'しゅ':['shu','syu'], 'しょ':['sho','syo'],
  'ちゃ':['cha','tya'], 'ちゅ':['chu','tyu'], 'ちょ':['cho','tyo'],
  'じゃ':['ja','jya'],  'じゅ':['ju','jyu'],  'じょ':['jo','jyo'],
};

/**
 * ひらがな文字列をローマ字に変換する
 * @param {string} kana
 * @returns {string}
 */
function kanaToRomaji(kana) {
  let result = '';
  let i = 0;
  while (i < kana.length) {
    // 2文字拗音優先
    if (i + 1 < kana.length && ROMAJI_TABLE[kana[i] + kana[i+1]]) {
      result += ROMAJI_TABLE[kana[i] + kana[i+1]];
      i += 2;
    } else if (ROMAJI_TABLE[kana[i]]) {
      result += ROMAJI_TABLE[kana[i]];
      i++;
    } else {
      result += kana[i];
      i++;
    }
  }
  return result;
}

/**
 * 入力済みローマ字が正しいかを前方一致で検証する
 * 複数の許容パターンを考慮する
 */
function validateRomajiPrefix(kana, typed) {
  const romaji = kanaToRomaji(kana);
  return romaji.startsWith(typed.toLowerCase());
}

// ===================================================
// 単語データベース
// ===================================================
const WORD_DB = {
  // レベル1: 1文字（母音・基本子音）
  1: [
    { kana:'あ', emoji:'🅰️' },
    { kana:'い', emoji:'🦔' },
    { kana:'う', emoji:'🐮' },
    { kana:'え', emoji:'🎨' },
    { kana:'お', emoji:'👹' },
    { kana:'か', emoji:'🦀' },
    { kana:'き', emoji:'🗝️' },
    { kana:'く', emoji:'👄' },
    { kana:'け', emoji:'⚗️' },
    { kana:'こ', emoji:'🧲' },
    { kana:'さ', emoji:'🐟' },
    { kana:'し', emoji:'🦌' },
    { kana:'す', emoji:'🍣' },
    { kana:'た', emoji:'🥚' },
    { kana:'に', emoji:'🌈' },
    { kana:'ふ', emoji:'⛵' },
    { kana:'ほ', emoji:'⭐' },
    { kana:'め', emoji:'👁️' },
    { kana:'や', emoji:'🏹' },
    { kana:'わ', emoji:'⭕' },
  ],

  // レベル2: 動物・食べ物（2〜3文字）
  2: [
    { kana:'いぬ',   emoji:'🐶' },
    { kana:'ねこ',   emoji:'🐱' },
    { kana:'うし',   emoji:'🐄' },
    { kana:'うま',   emoji:'🐴' },
    { kana:'ぶた',   emoji:'🐷' },
    { kana:'とり',   emoji:'🐦' },
    { kana:'さる',   emoji:'🐵' },
    { kana:'らいおん',emoji:'🦁' },
    { kana:'きりん', emoji:'🦒' },
    { kana:'ぞう',   emoji:'🐘' },
    { kana:'くま',   emoji:'🐻' },
    { kana:'うさぎ', emoji:'🐰' },
    { kana:'かめ',   emoji:'🐢' },
    { kana:'さかな', emoji:'🐟' },
    { kana:'たこ',   emoji:'🐙' },
    { kana:'かに',   emoji:'🦀' },
    { kana:'へび',   emoji:'🐍' },
    { kana:'かえる', emoji:'🐸' },
    { kana:'とんぼ', emoji:'🪲' },
    { kana:'ちょうちょ',emoji:'🦋' },
    { kana:'りんご', emoji:'🍎' },
    { kana:'みかん', emoji:'🍊' },
    { kana:'ぶどう', emoji:'🍇' },
    { kana:'すいか', emoji:'🍉' },
    { kana:'いちご', emoji:'🍓' },
    { kana:'ばなな', emoji:'🍌' },
    { kana:'もも',   emoji:'🍑' },
    { kana:'なし',   emoji:'🍐' },
    { kana:'くり',   emoji:'🌰' },
    { kana:'パン',   emoji:'🍞' },
  ],

  // レベル3: 文房具・学校・自然など（3〜5文字）
  3: [
    { kana:'えんぴつ',   emoji:'✏️' },
    { kana:'けしごむ',   emoji:'🧹' },
    { kana:'じょうぎ',   emoji:'📏' },
    { kana:'ランドセル', emoji:'🎒' },
    { kana:'こくばん',   emoji:'🖼️' },
    { kana:'ほんだな',   emoji:'📚' },
    { kana:'きょうしつ', emoji:'🏫' },
    { kana:'たいいくかん',emoji:'🏟️' },
    { kana:'としょかん', emoji:'📖' },
    { kana:'でんしゃ',   emoji:'🚃' },
    { kana:'じてんしゃ', emoji:'🚲' },
    { kana:'ひこうき',   emoji:'✈️' },
    { kana:'しんかんせん',emoji:'🚅' },
    { kana:'たいよう',   emoji:'☀️' },
    { kana:'つき',       emoji:'🌙' },
    { kana:'ほし',       emoji:'⭐' },
    { kana:'くも',       emoji:'☁️' },
    { kana:'かみなり',   emoji:'⚡' },
    { kana:'にじ',       emoji:'🌈' },
    { kana:'やまびこ',   emoji:'⛰️' },
    { kana:'かわ',       emoji:'🏞️' },
    { kana:'うみ',       emoji:'🌊' },
    { kana:'もり',       emoji:'🌳' },
    { kana:'コンピューター',emoji:'💻' },
    { kana:'キーボード', emoji:'⌨️' },
    { kana:'マウス',     emoji:'🖱️' },
    { kana:'プログラム', emoji:'📝' },
    { kana:'インターネット',emoji:'🌐' },
  ],
};

// ===================================================
// ゲーム設定
// ===================================================
const CONFIG = {
  TIME_LIMIT: 60,       // 秒
  BASE_SCORE: 100,      // 1問正解の基本点
  COMBO_BONUS: 10,      // コンボ1あたりのボーナス加算
  MAX_COMBO_BONUS: 5,   // 最大コンボ倍率（コンボ5以上で5倍ボーナス）
};

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
  // 状態初期化
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

  // 全問使い切ったらリセット
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
    // 正解！
    onCorrect();
  } else if (!romaji.startsWith(typed)) {
    // ミス
    onWrong();
  }
});

// IME確定対策：コンポジションイベント中は処理しない
let isComposing = false;
$('typing-input').addEventListener('compositionstart', () => { isComposing = true; });
$('typing-input').addEventListener('compositionend', e => {
  isComposing = false;
  // IME確定後に再チェック
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

  const bonus = Math.min(state.combo, CONFIG.MAX_COMBO_BONUS) * CONFIG.COMBO_BONUS;
  const gained = CONFIG.BASE_SCORE + bonus;
  state.score += gained;

  updateScoreDisplay();
  updateComboDisplay(true);

  // カード演出
  const card = $('word-card');
  card.classList.remove('correct', 'wrong');
  void card.offsetWidth;
  card.classList.add('correct');

  // 入力欄演出
  $('typing-input').classList.add('input-correct');

  // フィードバックメッセージ
  const msgs = ['すごい！', 'せいかい！', 'かんぺき！', 'やった！', 'すばらしい！'];
  $('feedback-area').textContent = msgs[Math.floor(Math.random() * msgs.length)];
  $('feedback-area').style.color = '#4caf50';

  // スコアポップアップ
  showScorePopup(`+${gained}`, '#f5a623');

  // パーティクル
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

  // 間違えた入力を消す
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

  // 評価
  const grade = getGrade(state.score, accuracy);
  $('result-grade').textContent = grade.text;
  $('result-grade').style.color = grade.color;
  $('result-mascot').textContent = grade.mascot;
  $('result-title').textContent = grade.title;

  showScreen('result');
  spawnParticles(20, '#f5a623');
}

function getGrade(score, accuracy) {
  if (score >= 3000 && accuracy >= 90) {
    return { text: '🏆 マスター！', color: '#f5a623', mascot: '🏆', title: 'すごい！マスターだ！' };
  } else if (score >= 2000 && accuracy >= 80) {
    return { text: '⭐⭐⭐ すごい！', color: '#4caf50', mascot: '🎉', title: 'とてもじょうず！' };
  } else if (score >= 1000 && accuracy >= 60) {
    return { text: '⭐⭐ いいね！', color: '#2196f3', mascot: '😊', title: 'いいかんじ！' };
  } else {
    return { text: '⭐ ファイト！', color: '#e94560', mascot: '💪', title: 'もっとれんしゅうしよう！' };
  }
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
  // ゲーム中はEnterキーで再フォーカス
  if (screens.game.classList.contains('active') && e.key === 'Enter') {
    $('typing-input').focus();
  }
});

// ===================================================
// 初期表示
// ===================================================
showScreen('title');

// ===================================================
// テスト用エクスポート（テストページからのみ使用）
// ===================================================
window.GameLogic = {
  kanaToRomaji,
  validateRomajiPrefix,
  getGrade,
  calcGainedScore(combo) {
    const bonus = Math.min(combo, CONFIG.MAX_COMBO_BONUS) * CONFIG.COMBO_BONUS;
    return CONFIG.BASE_SCORE + bonus;
  },
  WORD_DB,
  CONFIG,
  ROMAJI_TABLE,
  ROMAJI_ALT,
};
