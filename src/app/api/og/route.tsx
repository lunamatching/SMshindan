import { ImageResponse } from 'next/og'
import { getTypeByCode } from '@/data/types'

export const runtime = 'edge'

function parseAxisScores(as: string | null) {
  if (!as) return null
  const parts = as.split(',').map(Number)
  if (parts.length !== 8 || parts.some(isNaN)) return null
  const [L, F, M, B, D, N, S, P] = parts
  const lfTotal = L + F || 1
  const mbTotal = M + B || 1
  const dnTotal = D + N || 1
  const spTotal = S + P || 1
  return [
    { left: '主導', right: '服従', pct: Math.round((L / lfTotal) * 100) },
    { left: '精神', right: '肉体', pct: Math.round((M / mbTotal) * 100) },
    { left: '日常', right: '非日常', pct: Math.round((D / dnTotal) * 100) },
    { left: '純粋', right: '倒錯', pct: Math.round((S / spTotal) * 100) },
  ]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const typeCode = searchParams.get('type') ?? 'FBNS'
  const asParam = searchParams.get('as')

  const type = getTypeByCode(typeCode) ?? {
    code: 'FBNS', name: 'シンプルな受け', emoji: '🌸', description: 'バニラ。', rarity: 14,
    compatibleCode: 'LBNS', lunaUserCount: 678,
  }

  const axes = parseAxisScores(asParam)

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0d0117 0%, #1a0533 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          padding: '48px 60px',
        }}
      >
        {/* 枠線 */}
        <div
          style={{
            position: 'absolute',
            inset: '20px',
            border: '1px solid rgba(201, 168, 76, 0.3)',
            borderRadius: '24px',
          }}
        />

        <div style={{ fontSize: 16, color: '#c9a84c', marginBottom: 20, letterSpacing: '0.3em' }}>
          深層欲求タイプ診断
        </div>
        <div style={{ fontSize: 72, marginBottom: 12 }}>{type.emoji}</div>
        <div style={{ fontSize: 48, color: '#f5f0ff', fontWeight: 'bold', marginBottom: 6 }}>
          {type.name}
        </div>
        <div style={{ fontSize: 20, color: '#c9a84c', marginBottom: 8, letterSpacing: '0.2em' }}>
          {type.code}
        </div>
        <div
          style={{
            fontSize: 16,
            color: '#b8a9d0',
            textAlign: 'center',
            maxWidth: 640,
            lineHeight: 1.6,
            marginBottom: axes ? 24 : 28,
          }}
        >
          {type.description}
        </div>

        {/* 軸スコアバー */}
        {axes && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              width: '600px',
              marginBottom: 20,
            }}
          >
            {axes.map(({ left, right, pct }) => (
              <div key={left} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#c9a84c', fontSize: 13, width: 48, textAlign: 'right' }}>
                  {left} {pct}%
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 10,
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 5,
                    display: 'flex',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, #c9a84c, #f0d070)',
                      borderRadius: 5,
                    }}
                  />
                </div>
                <span style={{ color: '#7a6a90', fontSize: 13, width: 60 }}>
                  {100 - pct}% {right}
                </span>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            fontSize: 14,
            color: '#c9a84c',
            border: '1px solid rgba(201, 168, 76, 0.4)',
            borderRadius: 999,
            padding: '6px 20px',
          }}
        >
          全体の{type.rarity}% ｜ smshindan.luna.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
