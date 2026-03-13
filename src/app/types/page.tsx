import Link from 'next/link'
import type { Metadata } from 'next'
import { diagnosisTypes } from '@/data/types'

export const metadata: Metadata = {
  title: '全12タイプ一覧 | 深層欲求タイプ診断',
  description: '深層欲求タイプ診断の12タイプを詳しく解説します。',
}

// タイプコードから軸の特徴を読み取るヘルパー
function getAxisLabels(code: string) {
  const [lf, mb, dn, sp] = code.split('')
  return [
    lf === 'L' ? 'Lead' : 'Follow',
    mb === 'M' ? 'Mental' : 'Body',
    dn === 'D' ? 'Day' : 'Night',
    sp === 'S' ? 'Straight' : 'Perversion',
  ]
}

export default function TypesPage() {
  // L系（支配側）とF系（服従側）に分ける
  const lTypes = diagnosisTypes.filter((t) => t.code.startsWith('L'))
  const fTypes = diagnosisTypes.filter((t) => t.code.startsWith('F'))

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ヘッダー */}
      <div className="pt-6 space-y-2 text-center">
        <p className="text-luna-gold text-xs tracking-widest uppercase">タイプ図鑑</p>
        <h1 className="text-2xl font-bold text-luna-text font-serif-ja">全12タイプ一覧</h1>
        <p className="text-luna-muted text-sm leading-relaxed">
          深層欲求タイプの全12種を詳しく解説します
        </p>
      </div>

      {/* 主導系タイプ */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-luna-gold text-xs font-mono border border-luna-gold/40 rounded px-2 py-0.5">L｜Lead</span>
          <p className="text-luna-muted text-xs">関係性でリードする側</p>
        </div>
        <div className="space-y-3">
          {lTypes.map((type) => {
            const axes = getAxisLabels(type.code)
            return (
              <div key={type.code} className="rounded-xl border border-luna-border bg-luna-card/40 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{type.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-luna-text font-bold">{type.name}</p>
                      <span className="text-luna-gold text-xs font-mono border border-luna-gold/30 rounded px-1.5">{type.code}</span>
                      <span className="ml-auto text-luna-muted text-xs">全体の{type.rarity}%</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {axes.map((label) => (
                        <span key={label} className="text-[10px] px-2.5 py-1 rounded-full bg-luna-gold/10 border border-luna-gold/20 text-luna-gold/80">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-luna-muted text-xs leading-relaxed">{type.description}</p>
                <p className="text-luna-muted text-xs">
                  相性タイプ：
                  <span className="text-luna-gold">{diagnosisTypes.find((t) => t.code === type.compatibleCode)?.name ?? type.compatibleCode}</span>
                  （{type.compatibleCode}）
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 服従系タイプ */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-[#a78bfa] text-xs font-mono border border-[#a78bfa]/40 rounded px-2 py-0.5">F｜Follow</span>
          <p className="text-luna-muted text-xs">関係性で委ねる側</p>
        </div>
        <div className="space-y-3">
          {fTypes.map((type) => {
            const axes = getAxisLabels(type.code)
            return (
              <div key={type.code} className="rounded-xl border border-luna-border bg-luna-card/40 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{type.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-luna-text font-bold">{type.name}</p>
                      <span className="text-[#a78bfa] text-xs font-mono border border-[#a78bfa]/30 rounded px-1.5">{type.code}</span>
                      <span className="ml-auto text-luna-muted text-xs">全体の{type.rarity}%</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {axes.map((label) => (
                        <span key={label} className="text-[10px] px-2.5 py-1 rounded-full bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-[#a78bfa]/80">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-luna-muted text-xs leading-relaxed">{type.description}</p>
                <p className="text-luna-muted text-xs">
                  相性タイプ：
                  <span className="text-luna-gold">{diagnosisTypes.find((t) => t.code === type.compatibleCode)?.name ?? type.compatibleCode}</span>
                  （{type.compatibleCode}）
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ナビリンク */}
      <div className="flex gap-3">
        <Link
          href="/axes"
          className="flex-1 py-3 rounded-xl border border-luna-border text-luna-muted text-xs text-center hover:border-luna-gold/30 hover:text-luna-text transition-all duration-200"
        >
          ← 四軸の説明
        </Link>
        <Link
          href="/shindan"
          className="flex-1 py-3 rounded-xl bg-luna-gold/20 border border-luna-gold/50 text-luna-gold text-xs text-center font-semibold hover:bg-luna-gold/30 transition-all duration-200"
        >
          診断を受ける →
        </Link>
      </div>
      <div className="text-center">
        <Link href="/" className="text-luna-muted text-sm hover:text-luna-gold transition-colors">
          ← ホームに戻る
        </Link>
      </div>
    </div>
  )
}
