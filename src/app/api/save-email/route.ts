import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { getTypeByCode } from '@/data/types'
import { checkRateLimit } from '@/lib/rateLimiter'

// メールアドレスの簡易バリデーション
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/

interface EmailEntry {
  email: string
  typeCode: string
  subTypeCode?: string
  savedAt: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'emails.json')

async function loadEntries(): Promise<EmailEntry[]> {
  try {
    const raw = await readFile(DATA_FILE, 'utf-8')
    return JSON.parse(raw) as EmailEntry[]
  } catch {
    return []
  }
}

async function saveEntries(entries: EmailEntry[]): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
  await writeFile(DATA_FILE, JSON.stringify(entries, null, 2), 'utf-8')
}

export async function POST(req: NextRequest) {
  // レートリミット: IPアドレスベースで1時間10回まで
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
  const { allowed, resetAt } = checkRateLimit(ip, 'save-email')
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

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { email, typeCode, subTypeCode } = body as Record<string, unknown>

  if (typeof email !== 'string' || !EMAIL_REGEX.test(email) || email.length > 255) {
    return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 })
  }

  // typeCode: サーバー側のデータでホワイトリスト検証
  if (typeof typeCode !== 'string' || !getTypeByCode(typeCode)) {
    return NextResponse.json({ error: 'Invalid typeCode' }, { status: 400 })
  }

  // subTypeCode: 存在する場合はホワイトリスト検証
  const validSubTypeCode =
    typeof subTypeCode === 'string' && subTypeCode
      ? getTypeByCode(subTypeCode)
        ? subTypeCode
        : null
      : undefined

  if (typeof subTypeCode === 'string' && subTypeCode && validSubTypeCode === null) {
    return NextResponse.json({ error: 'Invalid subTypeCode' }, { status: 400 })
  }

  try {
    const entries = await loadEntries()

    // 重複チェック（同一メール + 同一タイプ）
    const isDuplicate = entries.some(
      (e) => e.email === email && e.typeCode === typeCode
    )
    if (isDuplicate) {
      return NextResponse.json({ message: 'すでに登録済みです' })
    }

    const newEntry: EmailEntry = {
      email,
      typeCode,
      ...(validSubTypeCode ? { subTypeCode: validSubTypeCode } : {}),
      savedAt: new Date().toISOString(),
    }

    entries.push(newEntry)
    await saveEntries(entries)

    return NextResponse.json({ message: '登録しました' })
  } catch (err) {
    console.error('[save-email] 保存エラー:', err)
    return NextResponse.json({ error: '保存に失敗しました。もう一度お試しください。' }, { status: 500 })
  }
}
