'use client'

import { useState } from 'react'

interface Props {
  typeCode: string
  subTypeCode?: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function SaveEmailForm({ typeCode, subTypeCode }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    try {
      const res = await fetch('/api/save-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), typeCode, subTypeCode }),
      })
      const data = await res.json() as { message?: string; error?: string }

      if (res.ok) {
        setStatus('success')
        setMessage(data.message ?? '登録しました')
        setEmail('')
      } else {
        setStatus('error')
        // サーバーエラーメッセージを固定文言で表示（内部情報の露出防止）
        setMessage(res.status === 429 ? 'しばらく後にお試しください' : '保存に失敗しました。もう一度お試しください。')
      }
    } catch {
      setStatus('error')
      setMessage('通信エラーが発生しました。もう一度お試しください。')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-luna-border bg-luna-card/40 p-5 space-y-2">
        <p className="text-luna-gold text-sm font-medium">✓ {message}</p>
        <p className="text-luna-muted text-xs">いつでも結果を確認できます</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-luna-border bg-luna-card/40 p-5 space-y-3">
      <p className="text-luna-text text-sm font-medium">結果を保存する</p>
      <p className="text-luna-muted text-xs">メールアドレスを登録すると、いつでも結果を確認できます</p>
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={status === 'loading'}
          required
          className="flex-1 py-2 px-3 rounded-lg bg-luna-bg border border-luna-border text-luna-text text-sm placeholder-luna-muted focus:outline-none focus:border-luna-gold/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className="px-4 py-2 rounded-lg bg-luna-gold/20 border border-luna-gold/40 text-luna-gold text-sm hover:bg-luna-gold/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? '…' : '保存'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-red-400 text-xs">{message}</p>
      )}
    </div>
  )
}
