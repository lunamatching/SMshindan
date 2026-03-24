import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getTypeByCode } from '@/data/types'
import { isValidTypeCode } from '@/lib/scoring'
import { FETISH_TAG_CATEGORIES } from '@/data/fetishTags'
import TypeCard from '@/components/TypeCard'
import FetishTagDisplay from '@/components/FetishTagDisplay'
import ShareButtons from '@/components/ShareButtons'
import SaveEmailForm from '@/components/SaveEmailForm'

const ALLOWED_TAGS = new Set(FETISH_TAG_CATEGORIES.flatMap((c) => c.tags))

interface AxisBar {
  leftLabel: string
  rightLabel: string
  leftPct: number  // 0〜100: 左側（主導・精神・日常・純粋）の強さ
}

// 各軸の最大差分: LF=(3+2)*2=10, MB=(3+3)*2=12, DN=(3+2)*2=10, SP=(1+4)*2=10
// 差分を [0,100] にマッピングすることで、常に勝者側が >50% になる
function parseAxisBars(as: string): AxisBar[] | null {
  if (!as) return null
  const parts = as.split(',').map(Number)
  if (parts.length !== 8 || parts.some(isNaN)) return null
  const [L, F, M, B, D, N, S, P] = parts

  // left側スコア - right側スコア の差を [0,100] に変換
  const diffPct = (left: number, right: number, maxDiff: number) =>
    Math.round((left - right + maxDiff) / (maxDiff * 2) * 100)

  // 50% タイ時は勝者側を 51% に補正
  const adjustTie = (pct: number, leftWins: boolean) =>
    pct === 50 ? (leftWins ? 51 : 49) : pct

  // Body が勝ち（M <= B）かつ生スコアでは Day が優勢（D > N）の場合、Day 49% / Night 51% 固定
  const bodyWins = M <= B
  const dayWouldWin = D > N
  const dnLeftPct = bodyWins && dayWouldWin
    ? 49
    : adjustTie(diffPct(D, N, 10), D > N && !bodyWins)

  return [
    { leftLabel: 'Lead',      rightLabel: 'Follow',     leftPct: adjustTie(diffPct(L, F, 10), L > F) },
    { leftLabel: 'Mental',    rightLabel: 'Body',       leftPct: adjustTie(diffPct(M, B, 12), M > B) },
    { leftLabel: 'Day',       rightLabel: 'Night',      leftPct: dnLeftPct },
    { leftLabel: 'Straight',  rightLabel: 'Perversion', leftPct: adjustTie(diffPct(S, P, 10), P <= S) },
  ]
}

interface Props {
  searchParams: { type?: string; sub?: string; sw?: string; tags?: string; r?: string; as?: string }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const type = getTypeByCode(searchParams.type ?? '')
  if (!type) return { title: '診断結果 | SM診断' }
  return {
    title: `${type.name}（${type.code}）| 深層欲求タイプ診断`,
    description: type.description,
    openGraph: {
      images: [`/api/og?type=${type.code}${searchParams.as ? `&as=${encodeURIComponent(searchParams.as)}` : ''}`],
    },
  }
}

export default function ResultPage({ searchParams }: Props) {
  const typeCode = searchParams.type ?? ''
  const subCode = searchParams.sub ?? ''

  if (!isValidTypeCode(typeCode)) notFound()

  const mainType = getTypeByCode(typeCode)!
  const subType = getTypeByCode(subCode)
  const isSwitcher = searchParams.sw === '1'
  // rarity: URLパラメータを 1〜100 の整数にクランプ
  const rarityRaw = parseInt(searchParams.r ?? '5', 10)
  const rarity = Number.isNaN(rarityRaw) ? 5 : Math.min(100, Math.max(1, rarityRaw))
  // tags: 既知タグのみ許可（ホワイトリストフィルタリング）
  const tags = searchParams.tags
    ? decodeURIComponent(searchParams.tags).split(',').filter((t) => ALLOWED_TAGS.has(t))
    : []

  // 軸スコア
  const axisBars = parseAxisBars(searchParams.as ?? '')
  const axisScores = searchParams.as ?? ''

  const compatibleType = getTypeByCode(mainType.compatibleCode)
  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://smshindan.luna.com'}/result?type=${typeCode}`

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* メインタイプ */}
      <div className="pt-6 space-y-2">
        <p className="text-luna-gold text-xs tracking-widest uppercase">診断結果</p>
        <TypeCard type={mainType} variant="main" isSwitcher={isSwitcher} />
        {/* Fetish タグ（メインタイプ枠と一体化） */}
        {tags.length > 0 && (
          <div className="px-7 py-5 border border-t-0 border-luna-gold/30 rounded-b-2xl -mt-3 pt-6 bg-luna-card/40">
            <FetishTagDisplay tags={tags} />
          </div>
        )}
      </div>


      {/* 四軸スコア */}
      {axisBars && (
        <div className="rounded-xl border border-luna-border bg-luna-card/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-luna-gold text-sm font-medium">四軸スコア</p>
            <Link href="/axes" className="text-luna-muted text-xs hover:text-luna-gold transition-colors">
              軸の説明 →
            </Link>
          </div>
          <div className="space-y-4">
            {axisBars.map(({ leftLabel, rightLabel, leftPct }) => (
              <div key={leftLabel} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-luna-text font-medium">
                    {leftLabel}
                    <span className="font-bold tabular-nums ml-1.5">{leftPct}%</span>
                  </span>
                  <span className="text-luna-text font-medium">
                    <span className="font-bold tabular-nums mr-1.5">{100 - leftPct}%</span>
                    {rightLabel}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-gold-gradient transition-all duration-700"
                    style={{ width: `${leftPct}%` }}
                  />
                  <div
                    className="h-full bg-white/15 transition-all duration-700 flex-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* サブタイプ */}
      {subType && subType.code !== mainType.code && (
        <div className="space-y-2">
          <TypeCard type={subType} variant="sub" />
        </div>
      )}

      {/* SNS シェア */}
      <div className="rounded-xl border border-luna-border bg-luna-card/40 p-5">
        <ShareButtons
          typeName={mainType.name}
          typeCode={mainType.code}
          rarity={rarity}
          url={pageUrl}
          axisScores={axisScores}
        />
      </div>

      {/* Luna 相性提案 */}
      {compatibleType && (
        <div className="rounded-xl border border-luna-gold/20 bg-luna-gold/5 p-5 space-y-2">
          <p className="text-luna-gold text-sm font-medium">あなたと相性のいいタイプ</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{compatibleType.emoji}</span>
            <div>
              <p className="text-luna-text font-semibold">{compatibleType.name}</p>
              <p className="text-luna-muted text-xs">{compatibleType.code}</p>
            </div>
          </div>
          <p className="text-luna-muted text-xs">
            今、Luna には <span className="text-luna-gold font-semibold">{compatibleType.lunaUserCount.toLocaleString()}人</span> の
            {compatibleType.name}タイプが登録しています
          </p>
          <a
            href="https://luna-match.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-3 mt-2 rounded-xl bg-gold-gradient hover:opacity-90 transition-opacity"
          >
            <Image src="/luna-logo-icon-t.png" alt="Luna" width={28} height={28} />
            <span className="text-luna-bg text-sm font-semibold">Lunaで相性のいい相手を探す</span>
          </a>
        </div>
      )}

      {/* タイプ説明リンク */}
      <div className="flex gap-3">
        <Link
          href="/axes"
          className="flex-1 py-3 rounded-xl border border-luna-border text-luna-muted text-xs text-center hover:border-luna-gold/30 hover:text-luna-text transition-all duration-200"
        >
          四軸の説明を見る
        </Link>
        <Link
          href="/types"
          className="flex-1 py-3 rounded-xl border border-luna-border text-luna-muted text-xs text-center hover:border-luna-gold/30 hover:text-luna-text transition-all duration-200"
        >
          全タイプ一覧を見る
        </Link>
      </div>

      {/* メールアドレス登録 */}
      <SaveEmailForm typeCode={mainType.code} subTypeCode={subType?.code} />

      {/* Luna ロゴフッター */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <a href="https://luna-match.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
          <Image src="/luna-logo-wide-t.png" alt="Luna" width={160} height={90} />
        </a>
        <Link href="/" className="text-luna-muted text-sm hover:text-luna-gold transition-colors">
          ← ホームに戻る
        </Link>
      </div>
    </div>
  )
}
