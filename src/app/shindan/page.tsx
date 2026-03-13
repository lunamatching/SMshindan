'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { allQuestions, type Question } from '@/data/questions'
import { calculateResult } from '@/lib/scoring'
import LikertScale from '@/components/LikertScale'

const PAGE_SIZE = 6 // 29問 ÷ 6 = 5ページ = 5タップ以内

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ShindanPage() {
  const router = useRouter()

  // マウント時に1回シャッフル
  const pages = useMemo<Question[][]>(() => {
    const shuffled = shuffle(allQuestions)
    const result: Question[][] = []
    for (let i = 0; i < shuffled.length; i += PAGE_SIZE) {
      result.push(shuffled.slice(i, i + PAGE_SIZE))
    }
    return result
  }, [])

  const [pageIndex, setPageIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'instant' as ScrollBehavior })
  }, [pageIndex])

  const totalPages = pages.length
  const currentPage = pages[pageIndex]
  const isLastPage = pageIndex === totalPages - 1

  const allOnPageAnswered = currentPage.every((q) => answers[q.id] !== undefined)
  const totalAnswered = Object.keys(answers).length
  const progressPct = Math.round((totalAnswered / allQuestions.length) * 100)

  const handleAnswer = (qId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }))
  }

  const handleNext = () => {
    if (!allOnPageAnswered) return

    if (!isLastPage) {
      setPageIndex((p) => p + 1)
      return
    }

    // 最終ページ → 結果計算 → 遷移
    const result = calculateResult(answers)
    const s = result.axisScores
    const params = new URLSearchParams({
      type: result.mainType,
      sub: result.subType,
      sw: result.isSwitcher ? '1' : '0',
      tags: encodeURIComponent(result.fetishTags.join(',')),
      r: String(result.rarity),
      as: `${s.L},${s.F},${s.M},${s.B},${s.D},${s.N},${s.S},${s.P}`,
    })
    router.push(`/result?${params.toString()}`)
  }

  const handleBack = () => {
    if (pageIndex > 0) {
      setPageIndex((p) => p - 1)
    }
  }

  return (
    <div ref={topRef} className="min-h-screen flex flex-col pb-10">
      {/* プログレスバー */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-luna-border z-50">
        <div
          className="h-full bg-luna-gold transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="pt-10 space-y-8">
        {/* ページ情報 */}
        <div className="flex items-center justify-between">
          <span className="text-luna-gold text-xs font-medium">
            {pageIndex + 1} / {totalPages} ページ
          </span>
          <span className="text-luna-muted text-xs">
            {totalAnswered} / {allQuestions.length} 回答済み
          </span>
        </div>

        {/* 設問リスト */}
        <div className="space-y-8">
          {currentPage.map((question, idx) => {
            const globalIdx = pageIndex * PAGE_SIZE + idx + 1
            return (
              <div key={question.id} className="space-y-4 animate-fade-in">
                <p className="text-luna-text text-base leading-relaxed">
                  <span className="text-luna-gold font-mono text-sm mr-2">Q{globalIdx}.</span>
                  {question.text}
                </p>
                <LikertScale
                  value={answers[question.id]}
                  onChange={(v) => handleAnswer(question.id, v)}
                />
              </div>
            )
          })}
        </div>

        {/* ナビゲーション */}
        <div className="flex gap-3 pt-2">
          {pageIndex > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 py-4 rounded-xl border border-luna-border text-luna-muted text-sm hover:border-luna-gold/30 hover:text-luna-text transition-all duration-200"
            >
              ← 戻る
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!allOnPageAnswered}
            className="flex-1 py-4 rounded-xl bg-luna-gold/20 border border-luna-gold/50 text-luna-gold font-semibold text-sm hover:bg-luna-gold/30 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isLastPage ? '✨ 結果を見る' : '次へ →'}
          </button>
        </div>

        {!allOnPageAnswered && (
          <p className="text-center text-luna-muted text-xs">
            このページの全問に回答すると次へ進めます
          </p>
        )}
      </div>
    </div>
  )
}
