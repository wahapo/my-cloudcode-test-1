/**
 * タイピングアドベンチャー — QUnit テストスイート
 *
 * 対象モジュール: window.GameLogic（js/game.js が公開）
 * 実行方法: ブラウザで tests/index.html を開く
 */

/* global QUnit, GameLogic */

const { kanaToRomaji, validateRomajiPrefix, getGrade, calcGainedScore,
        WORD_DB, CONFIG, ROMAJI_TABLE, ROMAJI_ALT } = GameLogic;

// ===================================================
// 1. kanaToRomaji — ひらがな→ローマ字変換
// ===================================================
QUnit.module('kanaToRomaji', () => {

  QUnit.module('母音（単文字）', () => {
    const cases = [
      ['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o'],
    ];
    cases.forEach(([kana, expected]) => {
      QUnit.test(`「${kana}」→ "${expected}"`, assert => {
        assert.strictEqual(kanaToRomaji(kana), expected);
      });
    });
  });

  QUnit.module('か行', () => {
    const cases = [
      ['か','ka'],['き','ki'],['く','ku'],['け','ke'],['こ','ko'],
    ];
    cases.forEach(([kana, expected]) => {
      QUnit.test(`「${kana}」→ "${expected}"`, assert => {
        assert.strictEqual(kanaToRomaji(kana), expected);
      });
    });
  });

  QUnit.module('さ行（変換ゆれあり）', () => {
    QUnit.test('「さ」→ "sa"', assert => assert.strictEqual(kanaToRomaji('さ'), 'sa'));
    QUnit.test('「し」→ "si"（テーブルの標準）', assert => assert.strictEqual(kanaToRomaji('し'), 'si'));
    QUnit.test('「す」→ "su"', assert => assert.strictEqual(kanaToRomaji('す'), 'su'));
  });

  QUnit.module('た行', () => {
    QUnit.test('「た」→ "ta"', assert => assert.strictEqual(kanaToRomaji('た'), 'ta'));
    QUnit.test('「ち」→ "ti"（テーブルの標準）', assert => assert.strictEqual(kanaToRomaji('ち'), 'ti'));
    QUnit.test('「つ」→ "tu"（テーブルの標準）', assert => assert.strictEqual(kanaToRomaji('つ'), 'tu'));
  });

  QUnit.module('な行', () => {
    const cases = [['な','na'],['に','ni'],['ぬ','nu'],['ね','ne'],['の','no']];
    cases.forEach(([k, r]) => QUnit.test(`「${k}」→ "${r}"`, assert => assert.strictEqual(kanaToRomaji(k), r)));
  });

  QUnit.module('は行', () => {
    QUnit.test('「は」→ "ha"', assert => assert.strictEqual(kanaToRomaji('は'), 'ha'));
    QUnit.test('「ふ」→ "fu"（テーブルの標準）', assert => assert.strictEqual(kanaToRomaji('ふ'), 'fu'));
  });

  QUnit.module('ん', () => {
    QUnit.test('「ん」→ "n"', assert => assert.strictEqual(kanaToRomaji('ん'), 'n'));
  });

  QUnit.module('濁音', () => {
    const cases = [
      ['が','ga'],['ぎ','gi'],['ぐ','gu'],['げ','ge'],['ご','go'],
      ['ざ','za'],['じ','zi'],['ず','zu'],['ぜ','ze'],['ぞ','zo'],
      ['だ','da'],['で','de'],['ど','do'],
      ['ば','ba'],['び','bi'],['ぶ','bu'],['べ','be'],['ぼ','bo'],
    ];
    cases.forEach(([k, r]) => QUnit.test(`「${k}」→ "${r}"`, assert => assert.strictEqual(kanaToRomaji(k), r)));
  });

  QUnit.module('半濁音', () => {
    const cases = [['ぱ','pa'],['ぴ','pi'],['ぷ','pu'],['ぺ','pe'],['ぽ','po']];
    cases.forEach(([k, r]) => QUnit.test(`「${k}」→ "${r}"`, assert => assert.strictEqual(kanaToRomaji(k), r)));
  });

  QUnit.module('拗音（2文字→1ローマ字）', () => {
    const cases = [
      ['きゃ','kya'],['きゅ','kyu'],['きょ','kyo'],
      ['しゃ','sha'],['しゅ','shu'],['しょ','sho'],
      ['ちゃ','cha'],['ちゅ','chu'],['ちょ','cho'],
      ['にゃ','nya'],['にゅ','nyu'],['にょ','nyo'],
      ['ひゃ','hya'],['ひゅ','hyu'],['ひょ','hyo'],
      ['りゃ','rya'],['りゅ','ryu'],['りょ','ryo'],
      ['じゃ','ja'], ['じゅ','ju'], ['じょ','jo'],
    ];
    cases.forEach(([k, r]) => QUnit.test(`「${k}」→ "${r}"`, assert => assert.strictEqual(kanaToRomaji(k), r)));
  });

  QUnit.module('複数文字の単語', () => {
    QUnit.test('「いぬ」→ "inu"', assert => assert.strictEqual(kanaToRomaji('いぬ'), 'inu'));
    QUnit.test('「ねこ」→ "neko"', assert => assert.strictEqual(kanaToRomaji('ねこ'), 'neko'));
    QUnit.test('「うさぎ」→ "usagi"', assert => assert.strictEqual(kanaToRomaji('うさぎ'), 'usagi'));
    QUnit.test('「えんぴつ」→ "enpitu"', assert => assert.strictEqual(kanaToRomaji('えんぴつ'), 'enpitu'));
    QUnit.test('「きょうしつ」→ "kyousitu"', assert => assert.strictEqual(kanaToRomaji('きょうしつ'), 'kyousitu'));
    QUnit.test('「ちょうちょ」→ "tyoucho"（拗音混在）', assert => {
      // ちょ → cho（拗音優先）、う → u、ちょ → cho
      assert.strictEqual(kanaToRomaji('ちょうちょ'), 'choucho');
    });
    QUnit.test('「らいおん」→ "raion"', assert => assert.strictEqual(kanaToRomaji('らいおん'), 'raion'));
  });

  QUnit.module('空文字列・エッジケース', () => {
    QUnit.test('空文字列 → ""', assert => assert.strictEqual(kanaToRomaji(''), ''));
    QUnit.test('テーブルにない文字はそのまま通す', assert => {
      // カタカナはテーブルにないのでそのまま
      const result = kanaToRomaji('ア');
      assert.strictEqual(result, 'ア');
    });
  });
});

// ===================================================
// 2. validateRomajiPrefix — 前方一致検証
// ===================================================
QUnit.module('validateRomajiPrefix', () => {

  QUnit.test('完全一致は true', assert => {
    assert.true(validateRomajiPrefix('いぬ', 'inu'));
  });

  QUnit.test('正しい前方一致は true', assert => {
    assert.true(validateRomajiPrefix('ねこ', 'n'));
    assert.true(validateRomajiPrefix('ねこ', 'ne'));
    assert.true(validateRomajiPrefix('ねこ', 'nek'));
  });

  QUnit.test('空入力は常に true（まだ何も打っていない）', assert => {
    assert.true(validateRomajiPrefix('あ', ''));
    assert.true(validateRomajiPrefix('いぬ', ''));
  });

  QUnit.test('ミスタイプは false', assert => {
    assert.false(validateRomajiPrefix('いぬ', 'x'));
    assert.false(validateRomajiPrefix('ねこ', 'na'));
    assert.false(validateRomajiPrefix('あ', 'b'));
  });

  QUnit.test('大文字入力を小文字に正規化して比較', assert => {
    assert.true(validateRomajiPrefix('いぬ', 'INU'));
    assert.true(validateRomajiPrefix('ねこ', 'NE'));
    assert.false(validateRomajiPrefix('ねこ', 'NA'));
  });

  QUnit.test('拗音の前方一致', assert => {
    assert.true(validateRomajiPrefix('きょうしつ', 'k'));
    assert.true(validateRomajiPrefix('きょうしつ', 'ky'));
    assert.true(validateRomajiPrefix('きょうしつ', 'kyo'));
  });

  QUnit.test('実際のレベル2単語で検証', assert => {
    assert.true(validateRomajiPrefix('うさぎ', 'usa'));
    assert.false(validateRomajiPrefix('うさぎ', 'use'));
  });
});

// ===================================================
// 3. getGrade — スコア評価
// ===================================================
QUnit.module('getGrade', () => {

  QUnit.test('マスター: score≥3000 かつ accuracy≥90', assert => {
    const g = getGrade(3000, 90);
    assert.ok(g.text.includes('マスター'), `text="${g.text}"`);
    assert.strictEqual(g.mascot, '🏆');
  });

  QUnit.test('マスター: score=5000, accuracy=100', assert => {
    const g = getGrade(5000, 100);
    assert.ok(g.text.includes('マスター'));
  });

  QUnit.test('マスターにならない: score=3000 だが accuracy=89', assert => {
    const g = getGrade(3000, 89);
    assert.false(g.text.includes('マスター'), `text="${g.text}"`);
  });

  QUnit.test('⭐⭐⭐: score≥2000 かつ accuracy≥80', assert => {
    const g = getGrade(2000, 80);
    assert.ok(g.text.includes('すごい'));
    assert.strictEqual(g.mascot, '🎉');
  });

  QUnit.test('⭐⭐⭐にならない: score=2000 だが accuracy=79', assert => {
    const g = getGrade(2000, 79);
    assert.false(g.mascot === '🎉');
  });

  QUnit.test('⭐⭐: score≥1000 かつ accuracy≥60', assert => {
    const g = getGrade(1000, 60);
    assert.ok(g.text.includes('いいね'));
    assert.strictEqual(g.mascot, '😊');
  });

  QUnit.test('⭐: 低スコア', assert => {
    const g = getGrade(0, 0);
    assert.ok(g.text.includes('ファイト'));
    assert.strictEqual(g.mascot, '💪');
  });

  QUnit.test('全評価で color プロパティが存在する', assert => {
    [getGrade(5000,100), getGrade(2500,85), getGrade(1200,65), getGrade(0,0)].forEach(g => {
      assert.ok(g.color && g.color.startsWith('#'), `color="${g.color}"`);
    });
  });

  QUnit.test('全評価で title プロパティが文字列', assert => {
    [getGrade(5000,100), getGrade(2500,85), getGrade(1200,65), getGrade(0,0)].forEach(g => {
      assert.strictEqual(typeof g.title, 'string');
      assert.ok(g.title.length > 0);
    });
  });
});

// ===================================================
// 4. calcGainedScore — スコア加算計算
// ===================================================
QUnit.module('calcGainedScore', () => {

  QUnit.test('コンボ0: BASE_SCORE のみ', assert => {
    assert.strictEqual(calcGainedScore(0), CONFIG.BASE_SCORE);
  });

  QUnit.test('コンボ1: BASE_SCORE + 1×COMBO_BONUS', assert => {
    assert.strictEqual(calcGainedScore(1), CONFIG.BASE_SCORE + CONFIG.COMBO_BONUS);
  });

  QUnit.test('コンボ5: BASE_SCORE + 5×COMBO_BONUS（上限）', assert => {
    const expected = CONFIG.BASE_SCORE + CONFIG.MAX_COMBO_BONUS * CONFIG.COMBO_BONUS;
    assert.strictEqual(calcGainedScore(5), expected);
  });

  QUnit.test('コンボ10: MAX_COMBO_BONUS でキャップされる', assert => {
    const cap    = calcGainedScore(CONFIG.MAX_COMBO_BONUS);
    const excess = calcGainedScore(CONFIG.MAX_COMBO_BONUS + 1);
    assert.strictEqual(cap, excess, 'コンボが上限を超えても点数は変わらない');
  });

  QUnit.test('コンボ100（極端値）もキャップされる', assert => {
    const expected = CONFIG.BASE_SCORE + CONFIG.MAX_COMBO_BONUS * CONFIG.COMBO_BONUS;
    assert.strictEqual(calcGainedScore(100), expected);
  });

  QUnit.test('常に正の整数を返す', assert => {
    [0, 1, 3, 5, 10].forEach(combo => {
      const score = calcGainedScore(combo);
      assert.ok(score > 0, `combo=${combo} → score=${score}`);
      assert.strictEqual(score, Math.floor(score), '整数であること');
    });
  });
});

// ===================================================
// 5. WORD_DB — 単語データベースの整合性
// ===================================================
QUnit.module('WORD_DB データ整合性', () => {

  [1, 2, 3].forEach(level => {
    QUnit.module(`レベル ${level}`, () => {

      QUnit.test('配列が存在し1件以上ある', assert => {
        assert.ok(Array.isArray(WORD_DB[level]));
        assert.ok(WORD_DB[level].length > 0, `${WORD_DB[level].length} 件`);
      });

      QUnit.test('全エントリに kana と emoji が存在する', assert => {
        WORD_DB[level].forEach((entry, i) => {
          assert.ok(entry.kana,  `[${i}].kana が空`);
          assert.ok(entry.emoji, `[${i}].emoji が空`);
        });
      });

      QUnit.test('kana はすべて文字列', assert => {
        WORD_DB[level].forEach((entry, i) => {
          assert.strictEqual(typeof entry.kana, 'string', `[${i}].kana`);
        });
      });

      QUnit.test('kana の重複がない', assert => {
        const kanas = WORD_DB[level].map(e => e.kana);
        const unique = new Set(kanas);
        assert.strictEqual(unique.size, kanas.length, '重複あり: ' + kanas.filter((k,i) => kanas.indexOf(k) !== i).join(', '));
      });

      QUnit.test('kanaToRomaji が空文字を返さない', assert => {
        WORD_DB[level].forEach(entry => {
          const romaji = kanaToRomaji(entry.kana);
          assert.ok(romaji.length > 0, `"${entry.kana}" のローマ字が空`);
        });
      });
    });
  });
});

// ===================================================
// 6. CONFIG — 設定値の妥当性
// ===================================================
QUnit.module('CONFIG', () => {

  QUnit.test('TIME_LIMIT は正の整数', assert => {
    assert.ok(Number.isInteger(CONFIG.TIME_LIMIT) && CONFIG.TIME_LIMIT > 0);
  });

  QUnit.test('BASE_SCORE は正の整数', assert => {
    assert.ok(Number.isInteger(CONFIG.BASE_SCORE) && CONFIG.BASE_SCORE > 0);
  });

  QUnit.test('COMBO_BONUS は正の整数', assert => {
    assert.ok(Number.isInteger(CONFIG.COMBO_BONUS) && CONFIG.COMBO_BONUS > 0);
  });

  QUnit.test('MAX_COMBO_BONUS は正の整数', assert => {
    assert.ok(Number.isInteger(CONFIG.MAX_COMBO_BONUS) && CONFIG.MAX_COMBO_BONUS > 0);
  });
});

// ===================================================
// 7. ROMAJI_TABLE — 変換テーブルの完全性
// ===================================================
QUnit.module('ROMAJI_TABLE', () => {

  const basicVowels = ['あ','い','う','え','お'];
  QUnit.test('母音5つが存在する', assert => {
    basicVowels.forEach(v => assert.ok(ROMAJI_TABLE[v], `「${v}」が存在しない`));
  });

  QUnit.test('全値が空でない文字列', assert => {
    Object.entries(ROMAJI_TABLE).forEach(([k, v]) => {
      assert.strictEqual(typeof v, 'string', `[${k}] の値が文字列でない`);
      assert.ok(v.length > 0, `[${k}] の値が空`);
    });
  });

  QUnit.test('全値が小文字アルファベットのみ', assert => {
    Object.entries(ROMAJI_TABLE).forEach(([k, v]) => {
      assert.ok(/^[a-z]+$/.test(v), `[${k}]="${v}" に小文字以外の文字が含まれる`);
    });
  });
});

// ===================================================
// 8. ROMAJI_ALT — 代替ローマ字テーブル
// ===================================================
QUnit.module('ROMAJI_ALT', () => {

  QUnit.test('「し」に "si" と "shi" が含まれる', assert => {
    assert.ok(ROMAJI_ALT['し'].includes('si'),  '"si" が存在しない');
    assert.ok(ROMAJI_ALT['し'].includes('shi'), '"shi" が存在しない');
  });

  QUnit.test('「ち」に "ti" と "chi" が含まれる', assert => {
    assert.ok(ROMAJI_ALT['ち'].includes('ti'));
    assert.ok(ROMAJI_ALT['ち'].includes('chi'));
  });

  QUnit.test('「つ」に "tu" と "tsu" が含まれる', assert => {
    assert.ok(ROMAJI_ALT['つ'].includes('tu'));
    assert.ok(ROMAJI_ALT['つ'].includes('tsu'));
  });

  QUnit.test('「ふ」に "fu" と "hu" が含まれる', assert => {
    assert.ok(ROMAJI_ALT['ふ'].includes('fu'));
    assert.ok(ROMAJI_ALT['ふ'].includes('hu'));
  });

  QUnit.test('全値が配列で2件以上', assert => {
    Object.entries(ROMAJI_ALT).forEach(([k, arr]) => {
      assert.ok(Array.isArray(arr), `[${k}] が配列でない`);
      assert.ok(arr.length >= 2, `[${k}] の代替が1件以下`);
    });
  });
});
