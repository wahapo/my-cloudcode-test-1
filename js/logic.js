/**
 * タイピングアドベンチャー — 純粋ロジック
 *
 * ブラウザ: <script src="js/logic.js"> でロードするとグローバル変数として使える
 * Node.js:  require('./js/logic.js') で使える
 */

'use strict';

// ===================================================
// ローマ字変換テーブル
// ===================================================
/* global var — ブラウザでは window に公開される */
var ROMAJI_TABLE = {
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
var ROMAJI_ALT = {
  'し':['si','shi'], 'ち':['ti','chi'], 'つ':['tu','tsu'],
  'ふ':['fu','hu'],  'じ':['zi','ji'],
  'しゃ':['sha','sya'], 'しゅ':['shu','syu'], 'しょ':['sho','syo'],
  'ちゃ':['cha','tya'], 'ちゅ':['chu','tyu'], 'ちょ':['cho','tyo'],
  'じゃ':['ja','jya'],  'じゅ':['ju','jyu'],  'じょ':['jo','jyo'],
};

// ===================================================
// 単語データベース
// ===================================================
var WORD_DB = {
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
var CONFIG = {
  TIME_LIMIT: 60,
  BASE_SCORE: 100,
  COMBO_BONUS: 10,
  MAX_COMBO_BONUS: 5,
};

// ===================================================
// 純粋関数
// ===================================================

/**
 * ひらがな文字列をローマ字に変換する
 * @param {string} kana
 * @returns {string}
 */
function kanaToRomaji(kana) {
  var result = '';
  var i = 0;
  while (i < kana.length) {
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
 * @param {string} kana
 * @param {string} typed
 * @returns {boolean}
 */
function validateRomajiPrefix(kana, typed) {
  var romaji = kanaToRomaji(kana);
  return romaji.startsWith(typed.toLowerCase());
}

/**
 * スコアと正解率からグレードを返す
 * @param {number} score
 * @param {number} accuracy  0–100
 * @returns {{ text: string, color: string, mascot: string, title: string }}
 */
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

/**
 * コンボ数から1問あたりの獲得スコアを計算する
 * @param {number} combo
 * @returns {number}
 */
function calcGainedScore(combo) {
  var bonus = Math.min(combo, CONFIG.MAX_COMBO_BONUS) * CONFIG.COMBO_BONUS;
  return CONFIG.BASE_SCORE + bonus;
}

// ===================================================
// エクスポート（Node.js / CommonJS）
// ===================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    kanaToRomaji,
    validateRomajiPrefix,
    getGrade,
    calcGainedScore,
    WORD_DB,
    CONFIG,
    ROMAJI_TABLE,
    ROMAJI_ALT,
  };
}
