'use client'

import { useState } from 'react'

interface Props {
  typeCode: string
  subTypeCode: string
  fetishTags: string[]
}

export default function ProfileGenerator({ typeCode, subTypeCode, fetishTags }: Props) {
  const [profile, setProfile] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typeCode, subTypeCode, fetishTags }),
      })
      if (!res.ok) throw new Error('生成に失敗しました')
      const data = await res.json()
      setProfile(data.profile)
    } catch {
      setError('プロフィール生成に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(profile)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-luna-gold/30 bg-luna-card/60 p-6 space-y-4">
      <div>
        <p className="text-luna-gold text-sm font-medium">AI 自己紹介文生成</p>
        <p className="text-luna-muted text-xs mt-1">診断結果をもとに、Luna の自己紹介文を自動生成します</p>
      </div>

      {!profile && (
        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-luna-gold/20 border border-luna-gold/50 text-luna-gold text-sm font-medium hover:bg-luna-gold/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '生成中...' : '✨ 自己紹介文を生成する'}
        </button>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {profile && (
        <div className="space-y-3">
          <div className="rounded-lg bg-luna-bg border border-luna-border p-4">
            <p className="text-luna-text text-sm leading-relaxed whitespace-pre-wrap">{profile}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 py-2 rounded-lg border border-luna-border text-luna-muted text-sm hover:border-luna-gold/30 hover:text-luna-text transition-all duration-200"
            >
              {copied ? '✅ コピーしました' : 'コピー'}
            </button>
            <button
              onClick={generate}
              disabled={loading}
              className="flex-1 py-2 rounded-lg border border-luna-gold/30 text-luna-gold text-sm hover:bg-luna-gold/10 transition-all duration-200 disabled:opacity-50"
            >
              再生成
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
