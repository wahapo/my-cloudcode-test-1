/**
 * タイピングアドベンチャー — Node.js テスト
 *
 * 実行方法: node tests/game.test.js
 * 依存: Node.js 標準ライブラリのみ（追加インストール不要）
 */

'use strict';

const assert = require('assert');
const {
  kanaToRomaji,
  validateRomajiPrefix,
  getGrade,
  calcGainedScore,
  WORD_DB,
  CONFIG,
  ROMAJI_TABLE,
  ROMAJI_ALT,
} = require('../js/logic.js');

// ===================================================
// 簡易テストランナー
// ===================================================
let passed = 0;
let failed = 0;

function describe(name, fn) {
  console.log(`\n【${name}】`);
  fn();
}

function test(desc, fn) {
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${desc}`);
    console.error(`    → ${e.message}`);
    failed++;
  }
}

// ===================================================
// 1. kanaToRomaji — ひらがな→ローマ字変換
// ===================================================
describe('kanaToRomaji / 母音', () => {
  test('あ → a',  () => assert.strictEqual(kanaToRomaji('あ'), 'a'));
  test('い → i',  () => assert.strictEqual(kanaToRomaji('い'), 'i'));
  test('う → u',  () => assert.strictEqual(kanaToRomaji('う'), 'u'));
  test('え → e',  () => assert.strictEqual(kanaToRomaji('え'), 'e'));
  test('お → o',  () => assert.strictEqual(kanaToRomaji('お'), 'o'));
});

describe('kanaToRomaji / か行', () => {
  test('か → ka', () => assert.strictEqual(kanaToRomaji('か'), 'ka'));
  test('き → ki', () => assert.strictEqual(kanaToRomaji('き'), 'ki'));
  test('く → ku', () => assert.strictEqual(kanaToRomaji('く'), 'ku'));
  test('け → ke', () => assert.strictEqual(kanaToRomaji('け'), 'ke'));
  test('こ → ko', () => assert.strictEqual(kanaToRomaji('こ'), 'ko'));
});

describe('kanaToRomaji / さ行', () => {
  test('さ → sa', () => assert.strictEqual(kanaToRomaji('さ'), 'sa'));
  test('し → si（テーブルの標準）', () => assert.strictEqual(kanaToRomaji('し'), 'si'));
  test('す → su', () => assert.strictEqual(kanaToRomaji('す'), 'su'));
  test('せ → se', () => assert.strictEqual(kanaToRomaji('せ'), 'se'));
  test('そ → so', () => assert.strictEqual(kanaToRomaji('そ'), 'so'));
});

describe('kanaToRomaji / た行', () => {
  test('た → ta', () => assert.strictEqual(kanaToRomaji('た'), 'ta'));
  test('ち → ti（テーブルの標準）', () => assert.strictEqual(kanaToRomaji('ち'), 'ti'));
  test('つ → tu（テーブルの標準）', () => assert.strictEqual(kanaToRomaji('つ'), 'tu'));
  test('て → te', () => assert.strictEqual(kanaToRomaji('て'), 'te'));
  test('と → to', () => assert.strictEqual(kanaToRomaji('と'), 'to'));
});

describe('kanaToRomaji / な行', () => {
  test('な → na', () => assert.strictEqual(kanaToRomaji('な'), 'na'));
  test('に → ni', () => assert.strictEqual(kanaToRomaji('に'), 'ni'));
  test('ぬ → nu', () => assert.strictEqual(kanaToRomaji('ぬ'), 'nu'));
  test('ね → ne', () => assert.strictEqual(kanaToRomaji('ね'), 'ne'));
  test('の → no', () => assert.strictEqual(kanaToRomaji('の'), 'no'));
});

describe('kanaToRomaji / は行', () => {
  test('は → ha', () => assert.strictEqual(kanaToRomaji('は'), 'ha'));
  test('ひ → hi', () => assert.strictEqual(kanaToRomaji('ひ'), 'hi'));
  test('ふ → fu（テーブルの標準）', () => assert.strictEqual(kanaToRomaji('ふ'), 'fu'));
  test('へ → he', () => assert.strictEqual(kanaToRomaji('へ'), 'he'));
  test('ほ → ho', () => assert.strictEqual(kanaToRomaji('ほ'), 'ho'));
});

describe('kanaToRomaji / ん', () => {
  test('ん → n', () => assert.strictEqual(kanaToRomaji('ん'), 'n'));
});

describe('kanaToRomaji / 濁音', () => {
  [
    ['が','ga'],['ぎ','gi'],['ぐ','gu'],['げ','ge'],['ご','go'],
    ['ざ','za'],['じ','zi'],['ず','zu'],['ぜ','ze'],['ぞ','zo'],
    ['だ','da'],['で','de'],['ど','do'],
    ['ば','ba'],['び','bi'],['ぶ','bu'],['べ','be'],['ぼ','bo'],
  ].forEach(([k, r]) => test(`${k} → ${r}`, () => assert.strictEqual(kanaToRomaji(k), r)));
});

describe('kanaToRomaji / 半濁音', () => {
  [['ぱ','pa'],['ぴ','pi'],['ぷ','pu'],['ぺ','pe'],['ぽ','po']].forEach(
    ([k, r]) => test(`${k} → ${r}`, () => assert.strictEqual(kanaToRomaji(k), r))
  );
});

describe('kanaToRomaji / 拗音（2文字→1ローマ字）', () => {
  [
    ['きゃ','kya'],['きゅ','kyu'],['きょ','kyo'],
    ['しゃ','sha'],['しゅ','shu'],['しょ','sho'],
    ['ちゃ','cha'],['ちゅ','chu'],['ちょ','cho'],
    ['にゃ','nya'],['にゅ','nyu'],['にょ','nyo'],
    ['ひゃ','hya'],['ひゅ','hyu'],['ひょ','hyo'],
    ['りゃ','rya'],['りゅ','ryu'],['りょ','ryo'],
    ['じゃ','ja'], ['じゅ','ju'], ['じょ','jo'],
  ].forEach(([k, r]) => test(`${k} → ${r}`, () => assert.strictEqual(kanaToRomaji(k), r)));
});

describe('kanaToRomaji / 複数文字の単語', () => {
  test('いぬ → inu',          () => assert.strictEqual(kanaToRomaji('いぬ'), 'inu'));
  test('ねこ → neko',         () => assert.strictEqual(kanaToRomaji('ねこ'), 'neko'));
  test('うさぎ → usagi',      () => assert.strictEqual(kanaToRomaji('うさぎ'), 'usagi'));
  test('えんぴつ → enpitu',   () => assert.strictEqual(kanaToRomaji('えんぴつ'), 'enpitu'));
  test('きょうしつ → kyousitu',() => assert.strictEqual(kanaToRomaji('きょうしつ'), 'kyousitu'));
  test('ちょうちょ → choucho（拗音混在）', () => assert.strictEqual(kanaToRomaji('ちょうちょ'), 'choucho'));
  test('らいおん → raion',    () => assert.strictEqual(kanaToRomaji('らいおん'), 'raion'));
  test('しんかんせん → sinkansen', () => assert.strictEqual(kanaToRomaji('しんかんせん'), 'sinkansen'));
});

describe('kanaToRomaji / エッジケース', () => {
  test('空文字列 → ""', () => assert.strictEqual(kanaToRomaji(''), ''));
  test('テーブルにない文字はそのまま通す', () => assert.strictEqual(kanaToRomaji('ア'), 'ア'));
});

// ===================================================
// 2. validateRomajiPrefix — 前方一致検証
// ===================================================
describe('validateRomajiPrefix', () => {
  test('完全一致は true',       () => assert.strictEqual(validateRomajiPrefix('いぬ', 'inu'), true));
  test('正しい前方一致(1文字)', () => assert.strictEqual(validateRomajiPrefix('ねこ', 'n'), true));
  test('正しい前方一致(2文字)', () => assert.strictEqual(validateRomajiPrefix('ねこ', 'ne'), true));
  test('正しい前方一致(3文字)', () => assert.strictEqual(validateRomajiPrefix('ねこ', 'nek'), true));
  test('空入力は常に true',     () => assert.strictEqual(validateRomajiPrefix('いぬ', ''), true));
  test('ミスタイプは false',    () => assert.strictEqual(validateRomajiPrefix('いぬ', 'x'), false));
  test('違う行は false',        () => assert.strictEqual(validateRomajiPrefix('ねこ', 'na'), false));
  test('大文字を小文字化して比較（INU）', () => assert.strictEqual(validateRomajiPrefix('いぬ', 'INU'), true));
  test('大文字を小文字化して比較（NE）',  () => assert.strictEqual(validateRomajiPrefix('ねこ', 'NE'), true));
  test('大文字でもミスは false', () => assert.strictEqual(validateRomajiPrefix('ねこ', 'NA'), false));
  test('拗音の前方一致(k)',      () => assert.strictEqual(validateRomajiPrefix('きょうしつ', 'k'), true));
  test('拗音の前方一致(ky)',     () => assert.strictEqual(validateRomajiPrefix('きょうしつ', 'ky'), true));
  test('拗音の前方一致(kyo)',    () => assert.strictEqual(validateRomajiPrefix('きょうしつ', 'kyo'), true));
  test('レベル2の単語(usa)',     () => assert.strictEqual(validateRomajiPrefix('うさぎ', 'usa'), true));
  test('レベル2の単語でミス',    () => assert.strictEqual(validateRomajiPrefix('うさぎ', 'use'), false));
});

// ===================================================
// 3. getGrade — スコア評価
// ===================================================
describe('getGrade / マスター', () => {
  test('score=3000, accuracy=90 → マスター', () => {
    const g = getGrade(3000, 90);
    assert.ok(g.text.includes('マスター'), `実際: "${g.text}"`);
    assert.strictEqual(g.mascot, '🏆');
  });
  test('score=5000, accuracy=100 → マスター', () => {
    const g = getGrade(5000, 100);
    assert.ok(g.text.includes('マスター'));
  });
  test('score=3000, accuracy=89 → マスターでない', () => {
    const g = getGrade(3000, 89);
    assert.ok(!g.text.includes('マスター'), `実際: "${g.text}"`);
  });
  test('score=2999, accuracy=90 → マスターでない', () => {
    const g = getGrade(2999, 90);
    assert.ok(!g.text.includes('マスター'), `実際: "${g.text}"`);
  });
});

describe('getGrade / ⭐⭐⭐', () => {
  test('score=2000, accuracy=80 → すごい', () => {
    const g = getGrade(2000, 80);
    assert.ok(g.text.includes('すごい'), `実際: "${g.text}"`);
    assert.strictEqual(g.mascot, '🎉');
  });
  test('score=2000, accuracy=79 → ⭐⭐⭐でない', () => {
    const g = getGrade(2000, 79);
    assert.notStrictEqual(g.mascot, '🎉');
  });
});

describe('getGrade / ⭐⭐', () => {
  test('score=1000, accuracy=60 → いいね', () => {
    const g = getGrade(1000, 60);
    assert.ok(g.text.includes('いいね'), `実際: "${g.text}"`);
    assert.strictEqual(g.mascot, '😊');
  });
  test('score=1000, accuracy=59 → ⭐⭐でない', () => {
    const g = getGrade(1000, 59);
    assert.notStrictEqual(g.mascot, '😊');
  });
});

describe('getGrade / ⭐', () => {
  test('score=0, accuracy=0 → ファイト', () => {
    const g = getGrade(0, 0);
    assert.ok(g.text.includes('ファイト'), `実際: "${g.text}"`);
    assert.strictEqual(g.mascot, '💪');
  });
  test('score=999, accuracy=100 → ⭐（スコア不足）', () => {
    const g = getGrade(999, 100);
    assert.strictEqual(g.mascot, '💪');
  });
});

describe('getGrade / 共通プロパティ', () => {
  [[5000,100],[2500,85],[1200,65],[0,0]].forEach(([s, a]) => {
    test(`score=${s}, accuracy=${a} → color が #xxx 形式`, () => {
      const g = getGrade(s, a);
      assert.ok(g.color && g.color.startsWith('#'), `color="${g.color}"`);
    });
    test(`score=${s}, accuracy=${a} → title が空でない文字列`, () => {
      const g = getGrade(s, a);
      assert.strictEqual(typeof g.title, 'string');
      assert.ok(g.title.length > 0);
    });
  });
});

// ===================================================
// 4. calcGainedScore — スコア加算計算
// ===================================================
describe('calcGainedScore', () => {
  test('コンボ0 → BASE_SCORE のみ', () => {
    assert.strictEqual(calcGainedScore(0), CONFIG.BASE_SCORE);
  });
  test('コンボ1 → BASE_SCORE + COMBO_BONUS', () => {
    assert.strictEqual(calcGainedScore(1), CONFIG.BASE_SCORE + CONFIG.COMBO_BONUS);
  });
  test('コンボ5 → BASE_SCORE + 5×COMBO_BONUS（上限）', () => {
    const expected = CONFIG.BASE_SCORE + CONFIG.MAX_COMBO_BONUS * CONFIG.COMBO_BONUS;
    assert.strictEqual(calcGainedScore(5), expected);
  });
  test('コンボ6 は コンボ5 と同じ（キャップ）', () => {
    assert.strictEqual(calcGainedScore(6), calcGainedScore(5));
  });
  test('コンボ100 もキャップされる', () => {
    const capped = CONFIG.BASE_SCORE + CONFIG.MAX_COMBO_BONUS * CONFIG.COMBO_BONUS;
    assert.strictEqual(calcGainedScore(100), capped);
  });
  test('常に正の値を返す', () => {
    [0, 1, 3, 5, 10].forEach(combo => {
      assert.ok(calcGainedScore(combo) > 0, `combo=${combo} で0以下`);
    });
  });
  test('整数を返す', () => {
    [0, 1, 5, 10].forEach(combo => {
      const s = calcGainedScore(combo);
      assert.strictEqual(s, Math.floor(s), `combo=${combo} → ${s} が整数でない`);
    });
  });
});

// ===================================================
// 5. WORD_DB — データ整合性
// ===================================================
[1, 2, 3].forEach(level => {
  describe(`WORD_DB / レベル${level}`, () => {
    const words = WORD_DB[level];

    test('配列が存在し1件以上ある', () => {
      assert.ok(Array.isArray(words));
      assert.ok(words.length > 0, `${words.length} 件`);
    });

    test('全エントリに kana と emoji がある', () => {
      words.forEach((entry, i) => {
        assert.ok(entry.kana,  `[${i}].kana が空`);
        assert.ok(entry.emoji, `[${i}].emoji が空`);
      });
    });

    test('kana はすべて文字列', () => {
      words.forEach((entry, i) => {
        assert.strictEqual(typeof entry.kana, 'string', `[${i}].kana`);
      });
    });

    test('kana の重複がない', () => {
      const kanas = words.map(e => e.kana);
      const dupes = kanas.filter((k, i) => kanas.indexOf(k) !== i);
      assert.strictEqual(dupes.length, 0, `重複: ${dupes.join(', ')}`);
    });

    test('kanaToRomaji が空文字を返さない', () => {
      words.forEach(entry => {
        const r = kanaToRomaji(entry.kana);
        assert.ok(r.length > 0, `"${entry.kana}" のローマ字が空`);
      });
    });
  });
});

// ===================================================
// 6. CONFIG — 設定値の妥当性
// ===================================================
describe('CONFIG', () => {
  test('TIME_LIMIT は正の整数', () => {
    assert.ok(Number.isInteger(CONFIG.TIME_LIMIT) && CONFIG.TIME_LIMIT > 0);
  });
  test('BASE_SCORE は正の整数', () => {
    assert.ok(Number.isInteger(CONFIG.BASE_SCORE) && CONFIG.BASE_SCORE > 0);
  });
  test('COMBO_BONUS は正の整数', () => {
    assert.ok(Number.isInteger(CONFIG.COMBO_BONUS) && CONFIG.COMBO_BONUS > 0);
  });
  test('MAX_COMBO_BONUS は正の整数', () => {
    assert.ok(Number.isInteger(CONFIG.MAX_COMBO_BONUS) && CONFIG.MAX_COMBO_BONUS > 0);
  });
});

// ===================================================
// 7. ROMAJI_TABLE — 変換テーブルの完全性
// ===================================================
describe('ROMAJI_TABLE', () => {
  test('母音5つが存在する', () => {
    ['あ','い','う','え','お'].forEach(v => {
      assert.ok(ROMAJI_TABLE[v], `「${v}」が存在しない`);
    });
  });
  test('全値が空でない文字列', () => {
    Object.entries(ROMAJI_TABLE).forEach(([k, v]) => {
      assert.strictEqual(typeof v, 'string', `[${k}] の値が文字列でない`);
      assert.ok(v.length > 0, `[${k}] の値が空`);
    });
  });
  test('全値が小文字アルファベットのみ', () => {
    Object.entries(ROMAJI_TABLE).forEach(([k, v]) => {
      assert.ok(/^[a-z]+$/.test(v), `[${k}]="${v}" に小文字以外が含まれる`);
    });
  });
});

// ===================================================
// 8. ROMAJI_ALT — 代替ローマ字テーブル
// ===================================================
describe('ROMAJI_ALT', () => {
  test('し に "si" と "shi" がある', () => {
    assert.ok(ROMAJI_ALT['し'].includes('si'));
    assert.ok(ROMAJI_ALT['し'].includes('shi'));
  });
  test('ち に "ti" と "chi" がある', () => {
    assert.ok(ROMAJI_ALT['ち'].includes('ti'));
    assert.ok(ROMAJI_ALT['ち'].includes('chi'));
  });
  test('つ に "tu" と "tsu" がある', () => {
    assert.ok(ROMAJI_ALT['つ'].includes('tu'));
    assert.ok(ROMAJI_ALT['つ'].includes('tsu'));
  });
  test('ふ に "fu" と "hu" がある', () => {
    assert.ok(ROMAJI_ALT['ふ'].includes('fu'));
    assert.ok(ROMAJI_ALT['ふ'].includes('hu'));
  });
  test('全エントリが配列で2件以上', () => {
    Object.entries(ROMAJI_ALT).forEach(([k, arr]) => {
      assert.ok(Array.isArray(arr), `[${k}] が配列でない`);
      assert.ok(arr.length >= 2, `[${k}] の代替が1件以下`);
    });
  });
});

// ===================================================
// 結果サマリー
// ===================================================
const total = passed + failed;
console.log('\n' + '━'.repeat(40));
console.log(`合計: ${total}  ✓ ${passed} 成功  ${failed > 0 ? '✗ ' + failed + ' 失敗' : ''}`);
console.log('━'.repeat(40));

if (failed > 0) process.exit(1);
