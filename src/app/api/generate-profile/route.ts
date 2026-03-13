import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getTypeByCode } from '@/data/types'
import { FETISH_TAG_CATEGORIES } from '@/data/fetishTags'
import { checkRateLimit } from '@/lib/rateLimiter'

const client = new Anthropic()

const ALLOWED_TAGS = new Set(FETISH_TAG_CATEGORIES.flatMap((c) => c.tags))

export async function POST(req: NextRequest) {
  // レートリミット: IPアドレスベースで1時間5回まで
  // x-real-ip はプロキシ（Vercel等）が設定するため信頼できる。
  // x-forwarded-for は先頭がクライアント制御可能なため最後尾を使用する。
  const xRealIp = req.headers.get('x-real-ip')
  const xForwardedFor = req.headers.get('x-forwarded-for')
  const ip = xRealIp ?? xForwardedFor?.split(',').at(-1)?.trim() ?? 'unknown'
  const { allowed, remaining, resetAt } = checkRateLimit(ip, 'generate-profile')
  if (!allowed) {
    return NextResponse.json(
      { error: 'リクエスト上限に達しました。しばらく後にお試しください。' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (
    typeof body !== 'object' || body === null ||
    typeof (body as Record<string, unknown>).typeCode !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { typeCode, subTypeCode, fetishTags } = body as {
    typeCode: string; subTypeCode?: string; fetishTags: string[]
  }

  // typeCode / subTypeCode はサーバー側のデータから取得（クライアント入力値を使用しない）
  const mainTypeData = getTypeByCode(typeCode)
  if (!mainTypeData) {
    return NextResponse.json({ error: 'Invalid type code' }, { status: 400 })
  }
  const subTypeData = subTypeCode ? getTypeByCode(subTypeCode) : undefined
  const typeName = mainTypeData.name
  const subTypeName = subTypeData?.name ?? ''

  // fetishTags: 既知タグのみ許可（ホワイトリスト検証）
  const tags = Array.isArray(fetishTags)
    ? fetishTags
        .filter((t) => typeof t === 'string' && ALLOWED_TAGS.has(t))
        .slice(0, 10)
        .join('、')
    : ''

  const prompt = `あなたは自己紹介文のライターです。ユーザーの深層欲求タイプ診断結果をもとに、Lunaというマッチングアプリ向けの自己紹介文を生成してください。

タイプ: ${typeName}（${typeCode}）
サブタイプ: ${subTypeName}
${tags ? `Fetishタグ: ${tags}` : ''}

条件:
- 200文字以内で簡潔に
- 直接的な性的表現は使わない
- 相手への興味・関係性への期待を前面に出す
- 上品で魅力的、自信のある文体
- 一人称「私」を使用
- 改行なしの1段落

自己紹介文のみを出力してください（説明や前置き不要）。`

  let message: Awaited<ReturnType<typeof client.messages.create>>
  try {
    message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })
  } catch (err) {
    console.error('[generate-profile] Anthropic API error:', err)
    return NextResponse.json(
      { error: '自己紹介文の生成に失敗しました。しばらく後にお試しください。' },
      { status: 503 }
    )
  }

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }

  return NextResponse.json({ profile: textBlock.text.trim() })
}
