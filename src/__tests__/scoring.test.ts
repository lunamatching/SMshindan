import { calculateResult, isValidTypeCode } from '@/lib/scoring'
import { allQuestions, axisQuestions } from '@/data/questions'
import type { Answers } from '@/lib/scoring'

// 全設問IDに同じスコアを設定
function allAnswers(score: number): Answers {
  return Object.fromEntries(allQuestions.map((q) => [q.id, score]))
}

// 軸設問のみに同じスコアを設定（Fetish設問は0）
function axisOnlyAnswers(score: number): Answers {
  return Object.fromEntries(axisQuestions.map((q) => [q.id, score]))
}

describe('calculateResult', () => {
  test('全問「とても当てはまる（2）」→ Follow 軸が優勢（逆転判定）', () => {
    const result = calculateResult(allAnswers(2))
    // LF: L方向(LF1,2,3)=6、F方向(LF4,5)=4 → L<F=false → Follow
    expect(result.mainType[0]).toBe('F')
    // SP: P方向(SP1,3,4,5)=8、S方向(SP2)=2 → P<S=false → Straight
    expect(result.mainType[3]).toBe('S')
    // DN: D方向(DN2,3,4)=6、N方向(DN1,5)=4 → D<N=false → Night
    expect(result.mainType[2]).toBe('N')
  })

  test('全問「全く当てはまらない（-2）」→ Lead / Night / Perversion（Body+Day補正によりNight）', () => {
    const result = calculateResult(allAnswers(-2))
    // LF: L=-6、F=-4 → L<F=true → Lead
    expect(result.mainType[0]).toBe('L')
    // MB: M=-6、B=-6 → M<B=false → Body
    // DN: D=-6、N=-4 → D<N=true だが Body のため Night に補正
    expect(result.mainType[2]).toBe('N')
    // SP: P=-8、S=-2 → P<S=true → Perversion
    expect(result.mainType[3]).toBe('P')
  })

  test('答えなし（空）でも正常に動作する', () => {
    const result = calculateResult({})
    expect(result.mainType).toHaveLength(4)
    expect(result.subType).toHaveLength(4)
    expect(typeof result.isSwitcher).toBe('boolean')
    expect(Array.isArray(result.fetishTags)).toBe(true)
  })

  test('メインタイプは常に有効な4文字コード', () => {
    expect(calculateResult(allAnswers(1)).mainType).toMatch(/^[LF][MB][DN][SP]$/)
    expect(calculateResult(allAnswers(-1)).mainType).toMatch(/^[LF][MB][DN][SP]$/)
    expect(calculateResult({}).mainType).toMatch(/^[LF][MB][DN][SP]$/)
  })

  test('サブタイプはメインタイプと1軸だけ異なる', () => {
    const result = calculateResult(allAnswers(1))
    let diff = 0
    for (let i = 0; i < 4; i++) {
      if (result.mainType[i] !== result.subType[i]) diff++
    }
    expect(diff).toBe(1)
  })

  test('スイッチャー判定：isSwitcher は mainType[0] !== subType[0] と一致する', () => {
    const result = calculateResult(allAnswers(1))
    expect(result.isSwitcher).toBe(result.mainType[0] !== result.subType[0])
  })

  test('rarity は 1 以上 100 以下', () => {
    const result = calculateResult(allAnswers(1))
    expect(result.rarity).toBeGreaterThanOrEqual(1)
    expect(result.rarity).toBeLessThanOrEqual(100)
  })

  // ── Fetish タグ（専用設問 FT1〜FT8）────────────────────────

  // 道具系
  test('FT1 score=1 → 縄, 鞭, レザーやラバー タグが付与される', () => {
    const result = calculateResult({ ...allAnswers(0), FT1: 1 })
    expect(result.fetishTags).toContain('縄')
    expect(result.fetishTags).toContain('鞭')
    expect(result.fetishTags).toContain('レザーやラバー')
  })

  test('FT1 score=0 → 縄 タグは付与されない', () => {
    const result = calculateResult({ ...allAnswers(0), FT1: 0 })
    expect(result.fetishTags).not.toContain('縄')
  })

  test('FT3 score=1 → 手錠, マミー タグが付与される', () => {
    const result = calculateResult({ ...allAnswers(0), FT3: 1 })
    expect(result.fetishTags).toContain('手錠')
    expect(result.fetishTags).toContain('マミー')
  })

  // 人体系
  test('FT4 score=1 → 人間の部位, 声 タグが付与される', () => {
    const result = calculateResult({ ...allAnswers(0), FT4: 1 })
    expect(result.fetishTags).toContain('人間の部位')
    expect(result.fetishTags).toContain('声')
  })

  test('FT5 score=1 → 匂い, 体液 タグが付与される', () => {
    const result = calculateResult({ ...allAnswers(0), FT5: 1 })
    expect(result.fetishTags).toContain('匂い')
    expect(result.fetishTags).toContain('体液')
  })

  // モラル系（まあ当てはまる以上で即時判定）
  test('FT7 score=1 → 露出, 羞恥 タグが付与される', () => {
    const result = calculateResult({ ...allAnswers(0), FT7: 1 })
    expect(result.fetishTags).toContain('露出')
    expect(result.fetishTags).toContain('羞恥')
  })

  test('FT7 score=0 → 露出, 羞恥 タグは付与されない', () => {
    const result = calculateResult({ ...allAnswers(0), FT7: 0 })
    expect(result.fetishTags).not.toContain('露出')
    expect(result.fetishTags).not.toContain('羞恥')
  })

  test('FT8 score=1 → NTR タグが付与される（まあ当てはまる以上で即時判定）', () => {
    const result = calculateResult({ ...allAnswers(0), FT8: 1 })
    expect(result.fetishTags).toContain('NTR')
  })

  test('FT8 score=0 → NTR タグは付与されない', () => {
    const result = calculateResult({ ...allAnswers(0), FT8: 0 })
    expect(result.fetishTags).not.toContain('NTR')
  })

  test('Fetish設問のスコアは軸スコアに影響しない', () => {
    const withFetish = calculateResult({ ...axisOnlyAnswers(1), FT1: 2, FT7: 2 })
    const withoutFetish = calculateResult(axisOnlyAnswers(1))
    expect(withFetish.mainType).toBe(withoutFetish.mainType)
    expect(withFetish.axisScores).toEqual(withoutFetish.axisScores)
  })

  test('allQuestions は 29 問（axis:21 + fetish:8）', () => {
    expect(allQuestions).toHaveLength(29)
    expect(allQuestions.filter((q) => q.kind === 'axis')).toHaveLength(21)
    expect(allQuestions.filter((q) => q.kind === 'fetish')).toHaveLength(8)
  })
})

describe('isValidTypeCode', () => {
  test('有効なコードは true を返す', () => {
    expect(isValidTypeCode('LMDS')).toBe(true)
    expect(isValidTypeCode('FBNP')).toBe(true)
    expect(isValidTypeCode('FBNS')).toBe(true)
    expect(isValidTypeCode('LMNP')).toBe(true)
  })

  test('無効なコードは false を返す', () => {
    expect(isValidTypeCode('XXXX')).toBe(false)
    expect(isValidTypeCode('')).toBe(false)
    expect(isValidTypeCode('LMD')).toBe(false)
  })
})
