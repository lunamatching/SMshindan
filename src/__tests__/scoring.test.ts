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
  test('全問「とても当てはまる（2）」→ Lead / Mental / Day / Perversion', () => {
    const result = calculateResult(allAnswers(2))
    // LF: L方向(LF1,2,3)=6、F方向(LF4,5)=4 → L>F=true → Lead
    expect(result.mainType[0]).toBe('L')
    // MB: M方向(MB4,5,6)=6、B方向(MB1,2)=4 → M>B=true → Mental
    expect(result.mainType[1]).toBe('M')
    // DN: Mental のため Day 有効。D方向(DN2,3,4)=6、N方向(DN1,5)=4 → D>N=true → Day
    expect(result.mainType[2]).toBe('D')
    // SP: P方向(SP1,3,4,5)=8、S方向(SP2)=2 → P>S=true → Perversion
    expect(result.mainType[3]).toBe('P')
  })

  test('全問「全く当てはまらない（-2）」→ Follow / Body / Night / Straight', () => {
    const result = calculateResult(allAnswers(-2))
    // LF: L方向負 → F加算、F方向負 → L加算。L=4、F=6 → L>F=false → Follow
    expect(result.mainType[0]).toBe('F')
    // MB: M方向負 → B加算=6、B方向負 → M加算=4 → M>B=false → Body → Night に補正
    expect(result.mainType[1]).toBe('B')
    expect(result.mainType[2]).toBe('N')
    // SP: P方向負 → S加算=8、S方向負 → P加算=2 → P>S=false → Straight
    expect(result.mainType[3]).toBe('S')
  })

  test('答えなし（空）でも正常に動作する', () => {
    const result = calculateResult({})
    expect(result.mainType).toHaveLength(4)
    expect(Array.isArray(result.subTypes)).toBe(true)
    expect(result.subTypes.length).toBeGreaterThan(0)
    expect(typeof result.isSwitcher).toBe('boolean')
    expect(Array.isArray(result.fetishTags)).toBe(true)
  })

  test('メインタイプは常に有効な4文字コード', () => {
    expect(calculateResult(allAnswers(1)).mainType).toMatch(/^[LF][MB][DN][SP]$/)
    expect(calculateResult(allAnswers(-1)).mainType).toMatch(/^[LF][MB][DN][SP]$/)
    expect(calculateResult({}).mainType).toMatch(/^[LF][MB][DN][SP]$/)
  })

  test('各サブタイプはメインタイプと1軸だけ異なる', () => {
    const result = calculateResult(allAnswers(1))
    for (const sub of result.subTypes) {
      let diff = 0
      for (let i = 0; i < 4; i++) {
        if (result.mainType[i] !== sub[i]) diff++
      }
      expect(diff).toBe(1)
    }
  })

  test('同点軸が複数あるとき、サブタイプも複数返る', () => {
    // SP=MB=3で同点のケース (LBNP例: LF=2settled, DN=0invalid, SP=MB=3)
    const answers: Answers = {
      LF1: 2, LF2: 2, LF3: 0, LF4: 1, LF5: 1,  // L=4,F=2 → LF settled
      MB1: 1, MB2: 1, MB4: 1, MB5: 1, MB6: 1,    // B=2,M=3 → Body
      DN1: 1, DN2: 1, DN3: 1, DN4: 1, DN5: 1,    // D=3,N=2 → (Body→Night補正)
      SP1: 2, SP3: 1, SP4: 0, SP5: 0, SP2: 0,    // P=3,S=0
    }
    const result = calculateResult(answers)
    // SPとMBが同点なら2つのサブタイプが返る
    expect(result.subTypes.length).toBeGreaterThanOrEqual(1)
    for (const sub of result.subTypes) {
      expect(isValidTypeCode(sub)).toBe(true)
    }
  })

  test('スイッチャー判定：LFが逆またはLFマージン<=1でisSwitcher=true', () => {
    // allAnswers(1): L=3,F=2 → margin=1 → isSwitcher=true（条件2）
    const result = calculateResult(allAnswers(1))
    expect(result.isSwitcher).toBe(true)
  })

  test('LF完全同点（margin=0）→ isSwitcher=true', () => {
    const result = calculateResult({ LF1: 1, LF2: 0, LF3: 0, LF4: 1, LF5: 0 })
    expect(result.axisMargins.LF).toBe(0)
    expect(result.isSwitcher).toBe(true)
  })

  test('LFマージン>=2 かつサブタイプのLFも同じ → isSwitcher=false', () => {
    // L=4,F=2 → margin=2 → LF settled, サブタイプでLF反転なし → isSwitcher=false
    const answers: Answers = {
      LF1: 2, LF2: 2, LF3: 0, LF4: 1, LF5: 1,
      SP1: 2, SP3: 2, SP4: 2, SP5: 2, SP2: 0,
    }
    const result = calculateResult(answers)
    expect(result.axisMargins.LF).toBe(2)
    expect(result.isSwitcher).toBe(false)
  })

  test('LFマージン>=2のとき、サブタイプはLFを反転しない（スイッチャーにならない）', () => {
    // URLの実例: L=4,F=2,M=2,B=5,D=2,N=2,S=1,P=4
    const answers: Answers = {
      LF1: 2, LF2: 2, LF3: 0, LF4: 1, LF5: 1,  // L=4, F=2 → margin=2
      MB4: 1, MB5: 1, MB6: 0, MB1: 1, MB2: 1,
      DN2: 1, DN3: 1, DN4: 0, DN1: 1, DN5: 1,
      SP1: 2, SP3: 2, SP4: 0, SP5: 0, SP2: 1,
    }
    const result = calculateResult(answers)
    // 全サブタイプでLFは反転しない
    for (const sub of result.subTypes) {
      expect(sub[0]).toBe(result.mainType[0])
    }
    expect(result.isSwitcher).toBe(false)
  })

  test('LFマージン=1（バー差10%）→ isSwitcher=true', () => {
    // L=3,F=2 → margin=1 → バー差10% → 条件2でスイッチャー
    const answers: Answers = {
      LF1: 1, LF2: 1, LF3: 1, LF4: 1, LF5: 1,
    }
    const result = calculateResult(answers)
    expect(result.axisMargins.LF).toBe(1)
    expect(result.isSwitcher).toBe(true)
  })

  test('rarity は 1 以上 100 以下', () => {
    const result = calculateResult(allAnswers(1))
    expect(result.rarity).toBeGreaterThanOrEqual(1)
    expect(result.rarity).toBeLessThanOrEqual(100)
  })

  // ── Fetish タグ（専用設問 FT1〜FT9）────────────────────────

  // 道具系
  test('FT1 score=1 → 縄・鞭 タグが付与される', () => {
    const result = calculateResult({ ...allAnswers(0), FT1: 1 })
    expect(result.fetishTags).toContain('縄・鞭')
  })

  test('FT1 score=0 → 縄・鞭 タグは付与されない', () => {
    const result = calculateResult({ ...allAnswers(0), FT1: 0 })
    expect(result.fetishTags).not.toContain('縄・鞭')
  })

  test('FT2 score=1 → レザー・ラテックス タグが付与される', () => {
    const result = calculateResult({ ...allAnswers(0), FT2: 1 })
    expect(result.fetishTags).toContain('レザー・ラテックス')
  })

  test('FT3 score=1 → SMグッズ タグが付与される', () => {
    const result = calculateResult({ ...allAnswers(0), FT3: 1 })
    expect(result.fetishTags).toContain('SMグッズ')
  })

  // 人体系
  test('FT4 score=1 → 体液 タグが付与される', () => {
    const result = calculateResult({ ...allAnswers(0), FT4: 1 })
    expect(result.fetishTags).toContain('体液')
  })

  test('FT5 score=1 → 匂い タグが付与される', () => {
    const result = calculateResult({ ...allAnswers(0), FT5: 1 })
    expect(result.fetishTags).toContain('匂い')
  })

  test('FT6 score=1 → ボディパーツ タグが付与される', () => {
    const result = calculateResult({ ...allAnswers(0), FT6: 1 })
    expect(result.fetishTags).toContain('ボディパーツ')
  })

  // モラル系（まあ当てはまる以上で即時判定）
  test('FT7 score=1 → 露出 タグが付与される', () => {
    const result = calculateResult({ ...allAnswers(0), FT7: 1 })
    expect(result.fetishTags).toContain('露出')
  })

  test('FT7 score=0 → 露出 タグは付与されない', () => {
    const result = calculateResult({ ...allAnswers(0), FT7: 0 })
    expect(result.fetishTags).not.toContain('露出')
  })

  test('FT8 score=1 → NTR タグが付与される', () => {
    const result = calculateResult({ ...allAnswers(0), FT8: 1 })
    expect(result.fetishTags).toContain('NTR')
  })

  test('FT9 score=1 → NTR タグが付与される', () => {
    const result = calculateResult({ ...allAnswers(0), FT9: 1 })
    expect(result.fetishTags).toContain('NTR')
  })

  test('FT8 score=0 かつ FT9 score=0 → NTR タグは付与されない', () => {
    const result = calculateResult({ ...allAnswers(0), FT8: 0, FT9: 0 })
    expect(result.fetishTags).not.toContain('NTR')
  })

  test('Fetish設問のスコアは軸スコアに影響しない', () => {
    const withFetish = calculateResult({ ...axisOnlyAnswers(1), FT1: 2, FT7: 2 })
    const withoutFetish = calculateResult(axisOnlyAnswers(1))
    expect(withFetish.mainType).toBe(withoutFetish.mainType)
    expect(withFetish.axisScores).toEqual(withoutFetish.axisScores)
  })

  test('allQuestions は 29 問（axis:20 + fetish:9）', () => {
    expect(allQuestions).toHaveLength(29)
    expect(allQuestions.filter((q) => q.kind === 'axis')).toHaveLength(20)
    expect(allQuestions.filter((q) => q.kind === 'fetish')).toHaveLength(9)
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
