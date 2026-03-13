'use client'

import { useState } from 'react'

interface Props {
  typeName: string
  typeCode: string
  rarity: number
  url: string
  axisScores?: string // "L,F,M,B,D,N,S,P" comma-separated
}

export default function ShareButtons({ typeName, typeCode, rarity, url, axisScores }: Props) {
  const [sharing, setSharing] = useState(false)
  const shareText = `深層欲求タイプ診断 結果：${typeName}（${typeCode}）\n全体の${rarity}%のレアタイプでした！\nあなたも診断してみて\n#深層欲求タイプ診断 #SM診断`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`

  const ogImageUrl = `/api/og?type=${typeCode}${axisScores ? `&as=${encodeURIComponent(axisScores)}` : ''}`

  const handleInstagram = async () => {
    setSharing(true)
    try {
      // 画像を fetch してファイルオブジェクトに変換
      const response = await fetch(ogImageUrl)
      const blob = await response.blob()
      const file = new File([blob], 'shindan-result.png', { type: 'image/png' })

      // ファイル共有対応のブラウザ（iOS Safari / Android Chrome 等）
      if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: '深層欲求タイプ診断', text: shareText, files: [file] })
        return
      }

      // URL 共有のみ対応のブラウザ
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: '深層欲求タイプ診断', text: `${shareText}\n${url}` })
        return
      }

      // デスクトップ：画像をダウンロード
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'shindan-result.png'
      a.click()
      URL.revokeObjectURL(a.href)
      alert('画像を保存しました。Instagramに投稿してください。')
    } catch (e) {
      // キャンセルまたはエラー（無視）
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-luna-muted text-sm text-center">結果をシェアする</p>
      <div className="flex gap-3">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1d9bf0]/20 border border-[#1d9bf0]/40 text-[#1d9bf0] text-sm font-medium hover:bg-[#1d9bf0]/30 transition-all duration-200"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          X でシェア
        </a>
        <button
          onClick={handleInstagram}
          disabled={sharing}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-br from-[#833AB4]/60 via-[#E1306C]/60 to-[#F77737]/60 border border-[#E1306C]/40 text-[#f0a0c0] text-sm font-medium hover:from-[#833AB4]/75 hover:via-[#E1306C]/75 hover:to-[#F77737]/75 transition-all duration-200 disabled:opacity-50"
        >
          {sharing ? (
            <span className="text-xs">準備中...</span>
          ) : (
            <>
              {/* Instagram camera icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
              </svg>
              Instagramでシェア
            </>
          )}
        </button>
      </div>
      <p className="text-luna-muted text-xs text-center">
        ※ Instagramでシェアすると軸スコア付きの画像が共有されます
      </p>
    </div>
  )
}
