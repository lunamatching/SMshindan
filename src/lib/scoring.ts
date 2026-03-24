import { allQuestions, type Axis, type Direction } from '@/data/questions'
import { diagnosisTypes, getTypeByCode } from '@/data/types'

export type Answers = Record<string, number>

export interface AxisScores {
  L: number; F: number
  M: number; B: number
  D: number; N: number
  S: number; P: number
}

export interface DiagnosisResult {
  mainType: string
  subTypes: string[]
  isSwitcher: boolean
  axisScores: AxisScores
  axisMargins: Record<Axis, number>
  fetishTags: string[]
  rarity: number
}

export function calculateResult(answers: Answers): DiagnosisResult {
  const axisScores: AxisScores = { L: 0, F: 0, M: 0, B: 0, D: 0, N: 0, S: 0, P: 0 }

  // 軸設問のみ軸スコアに加算
  // 正の回答 → 指定方向に加算、負の回答 → 反対方向に加算
  // これにより各軸の両側が同じ最大値を持ち、比較が公平になる
  const oppositeDir: Record<Direction, Direction> = {
    L: 'F', F: 'L', M: 'B', B: 'M', D: 'N', N: 'D', S: 'P', P: 'S',
  }
  for (const question of allQuestions) {
    if (question.kind === 'axis') {
      const score = answers[question.id] ?? 0
      if (score > 0) {
        axisScores[question.direction] += score
      } else if (score < 0) {
        axisScores[oppositeDir[question.direction]] += Math.abs(score)
      }
    }
  }

  const lfWinner = axisScores.L > axisScores.F ? 'L' : 'F'
  const mbWinner = axisScores.M > axisScores.B ? 'M' : 'B'
  // Body タイプに Day バリアントは存在しない（LBDS/LBDP/FBDS/FBDP は無効）ため B+D → B+N に補正
  const dnWinner = axisScores.D > axisScores.N && mbWinner !== 'B' ? 'D' : 'N'
  const spWinner = axisScores.P > axisScores.S ? 'P' : 'S'

  const mainType = `${lfWinner}${mbWinner}${dnWinner}${spWinner}`

  const axisMargins: Record<Axis, number> = {
    LF: Math.abs(axisScores.L - axisScores.F),
    MB: Math.abs(axisScores.M - axisScores.B),
    DN: Math.abs(axisScores.D - axisScores.N),
    SP: Math.abs(axisScores.P - axisScores.S),
  }

  // サブタイプ：最小マージングループ内の全有効候補を収集（同点時は複数サブタイプ表示）
  // 優先順: MB > SP > LF > DN
  // LFマージンがこの値以上なら確定済みとみなし、他軸で代替できる場合はLFを使わない
  const LF_SETTLED_THRESHOLD = 2
  const axisPriority: Record<Axis, number> = { MB: 0, SP: 1, LF: 2, DN: 3 }
  const allAxesSorted = (Object.entries(axisMargins) as [Axis, number][])
    .sort((a, b) => a[1] - b[1] || axisPriority[a[0]] - axisPriority[b[0]])

  const lfSettled = axisMargins.LF >= LF_SETTLED_THRESHOLD
  const primaryAxes = lfSettled ? allAxesSorted.filter(([a]) => a !== 'LF') : allAxesSorted
  const lfFallbackAxes = lfSettled ? allAxesSorted.filter(([a]) => a === 'LF') : []

  const collectSubTypes = (axes: [Axis, number][]): string[] => {
    const groups = new Map<number, Axis[]>()
    for (const [axis, margin] of axes) {
      if (!groups.has(margin)) groups.set(margin, [])
      groups.get(margin)!.push(axis)
    }
    for (const margin of [...groups.keys()].sort((a, b) => a - b)) {
      const candidates = groups.get(margin)!
        .map(axis => flipAxis(mainType, axis, { lfWinner, mbWinner, dnWinner, spWinner }))
        .filter(isValidTypeCode)
      if (candidates.length > 0) return candidates
    }
    return []
  }

  const subTypesFromPrimary = collectSubTypes(primaryAxes)
  const subTypes = subTypesFromPrimary.length > 0 ? subTypesFromPrimary : collectSubTypes(lfFallbackAxes)

  // スイッチャー判定
  // 条件1: いずれかのサブタイプでLead/Followがメインと逆
  // 条件2: LFバー差が10%以内（margin<=1 = 接戦）
  const isSwitcher = subTypes.some(s => s[0] !== mainType[0]) || axisMargins.LF <= 1

  // Fetishタグ：専用設問から判定
  const fetishTags = calculateFetishTags(answers)

  const typeData = getTypeByCode(mainType)
  const rarity = typeData?.rarity ?? 5

  return { mainType, subTypes, isSwitcher, axisScores, axisMargins, fetishTags, rarity }
}

function flipAxis(
  mainType: string,
  axis: Axis,
  winners: { lfWinner: string; mbWinner: string; dnWinner: string; spWinner: string }
): string {
  const { lfWinner, mbWinner, dnWinner, spWinner } = winners
  switch (axis) {
    case 'LF': return `${lfWinner === 'L' ? 'F' : 'L'}${mbWinner}${dnWinner}${spWinner}`
    case 'MB': return `${lfWinner}${mbWinner === 'M' ? 'B' : 'M'}${dnWinner}${spWinner}`
    case 'DN': return `${lfWinner}${mbWinner}${dnWinner === 'D' ? 'N' : 'D'}${spWinner}`
    case 'SP': return `${lfWinner}${mbWinner}${dnWinner}${spWinner === 'S' ? 'P' : 'S'}`
  }
}

function calculateFetishTags(answers: Answers): string[] {
  const tagSet = new Set<string>()

  for (const question of allQuestions) {
    if (question.kind === 'fetish') {
      const score = answers[question.id] ?? 0
      if (score >= question.threshold) {
        question.tags.forEach((tag) => tagSet.add(tag))
      }
    }
  }

  return Array.from(tagSet)
}

export function isValidTypeCode(code: string): boolean {
  return diagnosisTypes.some((t) => t.code === code)
}
