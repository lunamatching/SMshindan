import { allQuestions, type Axis } from '@/data/questions'
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
  for (const question of allQuestions) {
    if (question.kind === 'axis') {
      const score = answers[question.id] ?? 0
      axisScores[question.direction] += score
    }
  }

  const lfWinner = axisScores.L < axisScores.F ? 'L' : 'F'
  const mbWinner = axisScores.M < axisScores.B ? 'M' : 'B'
  const dnWinner = axisScores.D < axisScores.N ? 'D' : 'N'
  const spWinner = axisScores.P < axisScores.S ? 'P' : 'S'

  const mainType = `${lfWinner}${mbWinner}${dnWinner}${spWinner}`

  const axisMargins: Record<Axis, number> = {
    LF: Math.abs(axisScores.L - axisScores.F),
    MB: Math.abs(axisScores.M - axisScores.B),
    DN: Math.abs(axisScores.D - axisScores.N),
    SP: Math.abs(axisScores.P - axisScores.S),
  }

  // サブタイプ：最小マージンの軸を反転
  const minAxis = (Object.entries(axisMargins) as [Axis, number][])
    .reduce((min, curr) => (curr[1] < min[1] ? curr : min))

  const subType = flipAxis(mainType, minAxis[0], { lfWinner, mbWinner, dnWinner, spWinner })

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
