import Link from 'next/link'
import Image from 'next/image'

export default function StartPage() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* ヘッダー */}
      <header className="text-center space-y-3 pt-8">
        <p className="text-luna-gold text-xs tracking-[0.3em] uppercase">深層欲求タイプ診断</p>
        <h1 className="text-3xl font-bold text-luna-text font-serif-ja leading-tight">
          あなたの真の姿は<br />どれ？
        </h1>
        <p className="text-luna-muted text-sm leading-relaxed">
          21の設問であなたの深層欲求タイプを解析します
        </p>
      </header>

      {/* 年齢確認バナー */}
      <div className="rounded-xl border border-luna-gold/30 bg-luna-gold/5 p-4 text-center">
        <p className="text-luna-gold text-xs">⚠️ 本診断は 18歳以上 を対象としています</p>
      </div>

      {/* 診断開始ボタン */}
      <Link
        href="/shindan"
        className="block w-full py-4 rounded-2xl text-center font-semibold text-luna-bg bg-gold-gradient shadow-[0_0_24px_rgba(201,168,76,0.4)] hover:shadow-[0_0_32px_rgba(201,168,76,0.6)] transition-all duration-300 text-base"
      >
        診断スタート
      </Link>

      {/* BDSMとは */}
      <section className="rounded-xl border border-luna-border bg-luna-card/40 p-6 space-y-3">
        <h2 className="text-luna-text font-semibold text-sm">深層欲求タイプとは？</h2>
        <p className="text-luna-muted text-xs leading-relaxed">
          人の欲求パターンを「主導／服従」「精神／肉体」「日常／非日常」「純粋／倒錯」の4軸で分析し、
          あなたの恋愛における深層的な欲求タイプを12種に分類します。
          これは性格診断の一種であり、あなたの「本当の自分」を理解するためのツールです。
        </p>
        <p className="text-luna-muted text-xs leading-relaxed">
          診断は匿名で行われ、結果はあなたのデバイス内にのみ保存されます。
        </p>
      </section>

      {/* 四軸・全タイプ説明ボタン */}
      <section className="flex gap-3">
        <Link
          href="/axes"
          className="flex-1 py-4 rounded-xl border border-luna-border bg-luna-card/40 text-center hover:border-luna-gold/30 hover:bg-luna-card/60 transition-all duration-200 space-y-1"
        >
          <p className="text-luna-gold text-sm font-medium">四軸とは？</p>
          <p className="text-luna-muted text-xs">4つの欲求軸を解説</p>
        </Link>
        <Link
          href="/types"
          className="flex-1 py-4 rounded-xl border border-luna-border bg-luna-card/40 text-center hover:border-luna-gold/30 hover:bg-luna-card/60 transition-all duration-200 space-y-1"
        >
          <p className="text-luna-gold text-sm font-medium">全タイプ一覧</p>
          <p className="text-luna-muted text-xs">12タイプの詳細説明</p>
        </Link>
      </section>

      {/* フッター */}
      <footer className="flex flex-col items-center gap-3 pb-8">
        <a href="https://luna-match.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
          <Image src="/luna-logo-wide-t.png" alt="Luna" width={160} height={90} />
        </a>
        <p className="text-luna-muted text-xs">Powered by Luna</p>
      </footer>
    </div>
  )
}
