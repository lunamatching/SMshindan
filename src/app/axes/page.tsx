import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '四軸の説明 | 深層欲求タイプ診断',
  description: '深層欲求タイプ診断で使用する4つの軸（主導/服従・精神/肉体・日常/非日常・純粋/倒錯）を詳しく解説します。',
}

const AXES = [
  {
    axis: 'LF',
    title: '第1軸：Lead or Follow',
    subtitle: '主導権を握りたいか握られたいか',
    leftLabel: 'L｜Lead',
    rightLabel: 'F｜Follow',
    leftColor: 'text-[#f59e0b]',
    rightColor: 'text-[#a78bfa]',
    leftDesc: '関係性の中でリードすること、コントロールすることに喜びを感じる。相手の反応に責任を持ち、場の空気を作ることに長けている。',
    rightDesc: '相手に委ねること、導かれることに安心と喜びを感じる。信頼できる相手に身を任せることで深い解放感を得る。',
    note: 'どちらが優れているということはなく、相互補完的な関係性を形成します。L寄りのタイプとF寄りのタイプが理想的なパートナーとなる傾向があります。',
  },
  {
    axis: 'MB',
    title: '第2軸：Mental or Body',
    subtitle: '精神重視か肉体重視か',
    leftLabel: 'M｜Mental',
    rightLabel: 'B｜Body',
    leftColor: 'text-[#60a5fa]',
    rightColor: 'text-[#f87171]',
    leftDesc: '精神的なつながり、信頼関係、心の支配や服従に主な喜びを見出す。プレイよりも関係性そのものに深い意味を感じる。',
    rightDesc: '身体的な感覚、直接的な刺激、フィジカルな表現を通じて欲求を満たす。感覚そのものがコミュニケーションの手段となる。',
    note: '多くの人はM寄りとB寄りの間に位置します。精神と肉体は対立するものではなく、どちらも関係性を豊かにする要素です。',
  },
  {
    axis: 'DN',
    title: '第3軸：Day or Night',
    subtitle: '日常からかプレイの時だけか',
    leftLabel: 'D｜Day',
    rightLabel: 'N｜Night',
    leftColor: 'text-[#34d399]',
    rightColor: 'text-[#f472b6]',
    leftDesc: '日常生活の中でも支配/服従の関係性を継続させたい。24時間365日、あるいは日常の延長線上に関係性を置く。',
    rightDesc: 'プレイや特別な場面でのみ関係性が発動する。日常と非日常をはっきり切り分け、特別な時間として楽しむ。',
    note: 'D寄りは「生き方としてのライフスタイル」を求め、N寄りは「特別なエンターテインメント」として楽しむ傾向があります。どちらが正しいということはありません。',
  },
  {
    axis: 'SP',
    title: '第4軸：Straight or Perversion',
    subtitle: 'ストレートか倒錯か',
    leftLabel: 'S｜Straight',
    rightLabel: 'P｜Perversion',
    leftColor: 'text-[#a3e635]',
    rightColor: 'text-[#fb923c]',
    leftDesc: 'ストレートな愛情表現と感覚的な喜びを大切にする。複雑な縛りや道具よりも、自然で純粋な快楽のやりとりを好む。',
    rightDesc: '通常の性的文脈を超えた刺激や、フェティシズム的な要素に強い引力を感じる。非日常的・逸脱的な表現が快楽の源泉となる。',
    note: 'P寄りの傾向はごく自然なバリエーションです。双方の同意と安全を前提に、自己の欲求を正直に認識することが健全な関係性への第一歩です。',
  },
]

export default function AxesPage() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ヘッダー */}
      <div className="pt-6 space-y-2 text-center">
        <p className="text-luna-gold text-xs tracking-widest uppercase">診断の仕組み</p>
        <h1 className="text-2xl font-bold text-luna-text font-serif-ja">四軸の説明</h1>
        <p className="text-luna-muted text-sm leading-relaxed">
          あなたの深層欲求タイプは、4つの軸それぞれの傾向を組み合わせて決まります
        </p>
      </div>

      {/* 各軸の説明 */}
      {AXES.map((ax) => (
        <section key={ax.axis} className="rounded-xl border border-luna-border bg-luna-card/40 p-5 space-y-4">
          <div>
            <p className="text-luna-gold text-xs font-mono mb-1">{ax.axis}</p>
            <h2 className="text-luna-text font-bold text-lg">{ax.title}</h2>
            <p className="text-luna-muted text-xs">{ax.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-luna-bg/50 border border-luna-border p-3 space-y-1">
              <p className={`text-xs font-semibold font-mono ${ax.leftColor}`}>{ax.leftLabel}</p>
              <p className="text-luna-muted text-xs leading-relaxed">{ax.leftDesc}</p>
            </div>
            <div className="rounded-lg bg-luna-bg/50 border border-luna-border p-3 space-y-1">
              <p className={`text-xs font-semibold font-mono ${ax.rightColor}`}>{ax.rightLabel}</p>
              <p className="text-luna-muted text-xs leading-relaxed">{ax.rightDesc}</p>
            </div>
          </div>

          <div className="rounded-lg bg-luna-gold/5 border border-luna-gold/20 p-3">
            <p className="text-luna-muted text-xs leading-relaxed">
              <span className="text-luna-gold text-xs mr-1">💡</span>
              {ax.note}
            </p>
          </div>
        </section>
      ))}

      {/* ナビリンク */}
      <div className="flex gap-3">
        <Link
          href="/types"
          className="flex-1 py-3 rounded-xl border border-luna-border text-luna-muted text-xs text-center hover:border-luna-gold/30 hover:text-luna-text transition-all duration-200"
        >
          全タイプ一覧を見る →
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
