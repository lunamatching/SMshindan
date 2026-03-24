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
  subType: string
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

  // サブタイプ：マージンが小さい軸から順に反転を試み、有効なタイプが得られた最初のものを採用
  // 同点時はLF > SP > MB > DNの優先順で決定論的にタイブレーク
  const axisPriority: Record<Axis, number> = { LF: 0, SP: 1, MB: 2, DN: 3 }
  const sortedAxes = (Object.entries(axisMargins) as [Axis, number][])
    .sort((a, b) => a[1] - b[1] || axisPriority[a[0]] - axisPriority[b[0]])
  let subType = mainType
  for (const [axis] of sortedAxes) {
    const candidate = flipAxis(mainType, axis, { lfWinner, mbWinner, dnWinner, spWinner })
    if (isValidTypeCode(candidate)) {
      subType = candidate
      break
    }
  }

  // スイッチャー判定
  const isSwitcher = mainType[0] !== subType[0]

  // Fetishタグ：専用設問から判定
  const fetishTags = calculateFetishTags(answers)

  const typeData = getTypeByCode(mainType)
  const rarity = typeData?.rarity ?? 5

  return { mainType, subType, isSwitcher, axisScores, axisMargins, fetishTags, rarity }
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
