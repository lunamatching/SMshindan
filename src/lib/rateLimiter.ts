interface RateLimitEntry {
  count: number
  resetAt: number
}

// インメモリストア（サーバーレス環境では再起動でリセットされる）
const store = new Map<string, RateLimitEntry>()

const WINDOW_MS = 60 * 60 * 1000 // 1時間

// キー別の設定（APIごとに異なるリミットを設定可能）
const LIMITS: Record<string, number> = {
  'generate-profile': 5,  // 1時間に5回
  'save-email': 10,       // 1時間に10回
}
const DEFAULT_LIMIT = 5

// 期限切れエントリを定期的にクリーンアップ（メモリリーク防止）
function cleanup() {
  const now = Date.now()
  store.forEach((entry, key) => {
    if (now > entry.resetAt) store.delete(key)
  })
}
setInterval(cleanup, 10 * 60 * 1000) // 10分ごとにクリーンアップ

export function checkRateLimit(
  ip: string,
  resource: string = 'default'
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const storeKey = `${resource}:${ip}`
  const maxRequests = LIMITS[resource] ?? DEFAULT_LIMIT
  const entry = store.get(storeKey)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + WINDOW_MS
    store.set(storeKey, { count: 1, resetAt })
    return { allowed: true, remaining: maxRequests - 1, resetAt }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
}
