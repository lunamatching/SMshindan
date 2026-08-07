import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getTypeByCode } from '@/data/types'
import { isValidTypeCode } from '@/lib/scoring'
import { FETISH_TAG_CATEGORIES } from '@/data/fetishTags'
import FetishTagDisplay from '@/components/FetishTagDisplay'
import FeedbackForm from '@/components/FeedbackForm'
import ShareButton from '@/components/ShareButton'
import ResultSaver from '@/components/ResultSaver'
import { TYPE_IMAGES } from '@/lib/typeImages'

const ALLOWED_TAGS = new Set(FETISH_TAG_CATEGORIES.flatMap((c) => c.tags))


const C = {
  bg:          '#f6f2f9',
  tag:         '#e8e0f0',
  border:      '#c8b8d8',
  borderLight: '#ddd0e8',
  accent:      '#7040b8',
  text:        '#201535',
  muted:       '#5a4570',
  sub:         '#4255c8',   // 弱い側の色
  gold:        '#9a7840',
  metal:       '#1c1c1e',   // ダークメタリック（強軸）
}

interface AxisBar {
  leftLabel: string
  rightLabel: string
  leftPct: number
}

function renderMd(text: string) {
  return (
    <>
      {text.split('\n\n').map((para, pi) => (
        <p key={pi} className="text-base leading-relaxed mb-2" style={{ color: C.text }}>
          {para.replace(/\*\*/g, '').split('\n').map(line => line.replace(/^-\s*/, '')).join('\n')}
        </p>
      ))}
    </>
  )
}

function parseAxisBars(as: string): AxisBar[] | null {
  if (!as) return null
  const parts = as.split(',').map(Number)
  if (parts.length !== 8 || parts.some(isNaN)) return null
  const [L, F, M, B, D, N, S, P] = parts

  const diffPct = (left: number, right: number, maxDiff: number) =>
    Math.round((left - right + maxDiff) / (maxDiff * 2) * 100)
  const adjustTie = (pct: number, leftWins: boolean) =>
    pct === 50 ? (leftWins ? 51 : 49) : pct
  const bodyWins = M <= B
  const dayWouldWin = D > N
  const dnLeftPct = bodyWins && dayWouldWin
    ? 49
    : adjustTie(diffPct(D, N, 12), D > N && !bodyWins)

  return [
    { leftLabel: 'Lead',      rightLabel: 'Follow',     leftPct: adjustTie(diffPct(L, F, 12), L > F) },
    { leftLabel: 'Mental',    rightLabel: 'Body',       leftPct: adjustTie(diffPct(M, B, 16), M > B) },
    { leftLabel: 'Day',       rightLabel: 'Night',      leftPct: dnLeftPct },
    { leftLabel: 'Straight',  rightLabel: 'Perversion', leftPct: P < 6 ? Math.round(100 - (P / 5.5 * 49)) : Math.round(49 - ((P - 6) / 15 * 49)) },
  ]
}

interface Props {
  searchParams: { type?: string; subs?: string; sub?: string; sw?: string; tags?: string; r?: string; as?: string; ref?: string; age?: string; gender?: string }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const type = getTypeByCode(searchParams.type ?? '')
  if (!type) return { title: '診断結果 | SM診断' }
  const imageUrl = `https://lunadeeptype.vercel.app/api/og?type=${type.code}`
  return {
    title: `${type.name}（${type.code}）| 深層欲求ディープタイプ診断`,
    description: type.description,
    openGraph: {
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', images: [imageUrl] },
  }
}

const VALID_AGE_GROUPS = new Set(['18-19', '20s', '30s', '40s', '50s', '60s+'])
const VALID_GENDERS    = new Set(['female', 'male', 'other'])

export default function ResultPage({ searchParams }: Props) {
  const typeCode = searchParams.type ?? ''
  const subCodes = (searchParams.subs ?? searchParams.sub ?? '').split(',').filter(Boolean)
  const ageGroup = VALID_AGE_GROUPS.has(searchParams.age ?? '') ? searchParams.age! : undefined
  const gender   = VALID_GENDERS.has(searchParams.gender ?? '')   ? searchParams.gender! : undefined

  if (!isValidTypeCode(typeCode)) notFound()

  const mainType    = getTypeByCode(typeCode)!
  const subTypes    = subCodes.map(c => getTypeByCode(c)).filter((t): t is NonNullable<typeof t> => t != null)
  const isSwitcher  = searchParams.sw === '1'
  const rarityRaw   = parseInt(searchParams.r ?? '5', 10)
  const rarity      = Number.isNaN(rarityRaw) ? 5 : Math.min(100, Math.max(1, rarityRaw))
  const tags        = searchParams.tags
    ? decodeURIComponent(searchParams.tags).split(',').filter((t) => ALLOWED_TAGS.has(t))
    : []

  const axisBars       = parseAxisBars(searchParams.as ?? '')
  const axisScores     = searchParams.as ?? ''
  const compatibleType = getTypeByCode(mainType.compatibleCode)
  const shareParams = new URLSearchParams({ type: typeCode })
  if (searchParams.subs) shareParams.set('subs', searchParams.subs)
  if (searchParams.sw)   shareParams.set('sw',   searchParams.sw)
  if (searchParams.tags) shareParams.set('tags', searchParams.tags)
  if (searchParams.as)   shareParams.set('as',   searchParams.as)
  shareParams.set('ref', 'share')
  const pageUrl        = `https://lunadeeptype.vercel.app/result?${shareParams}`
  const isFromShare    = searchParams.ref === 'share'

  // 「詳細を見る」は結果ページのまま menu パラメータを追加（ホームに飛ばさない）
  const baseResultParams = new URLSearchParams({
    type: typeCode,
    ...(searchParams.subs    ? { subs:    searchParams.subs    } : {}),
    ...(searchParams.sw      ? { sw:      searchParams.sw      } : {}),
    ...(searchParams.tags    ? { tags:    searchParams.tags    } : {}),
    ...(searchParams.r       ? { r:       searchParams.r       } : {}),
    ...(searchParams.as      ? { as:      searchParams.as      } : {}),
    ...(searchParams.age     ? { age:     searchParams.age     } : {}),
    ...(searchParams.gender  ? { gender:  searchParams.gender  } : {}),
  })
  baseResultParams.set('menu', 'axes')
  const menuAxesUrl   = `/result?${baseResultParams}`
  baseResultParams.set('menu', 'fetish')
  const menuFetishUrl = `/result?${baseResultParams}`
  baseResultParams.delete('menu')

  const hasSubOrCompat = subTypes.length > 0 || !!compatibleType

  return (
    <div className="animate-fade-in -mx-2 -mt-6 px-2 pt-6 pb-12 min-h-screen"
      style={{ color: C.text }}>
      <ResultSaver typeCode={typeCode} tags={tags} isSwitcher={isSwitcher} />

      <div className="pt-2 pb-4 text-center">
        <p className="text-sm tracking-[0.5em] uppercase font-semibold" style={{ color: C.gold }}>診断結果</p>
      </div>

      {/* ━━━ メインカード（design/i 構造） ━━━ */}
      <section className="rounded-2xl px-2 py-5"
        style={{ background: C.bg, border: `1px solid ${C.border}` }}>

        {/* ── 01 タイプ判定 ── */}
        <div className={TYPE_IMAGES.has(mainType.code) ? 'pb-4 mb-4' : 'pb-10 mb-10'} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
          {/* 中央揃えヒーロー */}
          <div className="flex flex-col items-center text-center gap-3">
            {TYPE_IMAGES.has(mainType.code) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/types/${mainType.code}.png`} alt={mainType.name} style={{ width: 280, height: 280, objectFit: 'contain' }} />
            ) : (
              <p className="text-[88px] leading-none">{mainType.emoji}</p>
            )}
            <div className="mb-5">
              <h2 className="text-4xl font-bold font-serif-ja leading-tight mb-1" style={{ color: C.text }}>
                {mainType.name}
              </h2>
              <span className="text-4xl font-bold font-cormorant" style={{ color: C.accent }}>
                {mainType.code}
              </span>
              {mainType.code === 'FBNP' && (
                <p className="text-xs mt-1" style={{ color: C.muted }}>旧エコー・マゾ</p>
              )}
            </div>
          </div>
          {(tags.length > 0 || isSwitcher) && (
            <div className="mt-4 space-y-2">
              <p className="text-base font-semibold tracking-widest uppercase" style={{ color: C.muted }}>tags</p>
              <div className="flex flex-wrap gap-1.5 items-center">
                {isSwitcher && (
                  <div className="inline-flex items-center rounded-full px-3 py-1"
                    style={{ background: C.tag, border: `1px solid ${C.border}` }}>
                    <span className="text-sm" style={{ color: C.accent }}>スイッチャー</span>
                  </div>
                )}
                {tags.length > 0 && <FetishTagDisplay tags={tags} />}
                <Link href={menuFetishUrl}
                  className="text-sm whitespace-nowrap shrink-0 ml-auto hover:opacity-70 transition-opacity"
                  style={{ color: C.accent }}>
                  タグの解説 →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── 02 四軸スコア（コンパクト） ── */}
        {axisBars && (
          <div className="pb-10 mb-10 space-y-2.5" style={{ borderBottom: `1px solid ${C.borderLight}` }}>
            <div className="flex items-baseline gap-2 mb-5">
                <span className="text-2xl font-black" style={{ color: C.accent }}>四軸スコア</span>
              <Link href={menuAxesUrl}
                className="text-sm whitespace-nowrap shrink-0 ml-auto hover:opacity-70 transition-opacity"
                style={{ color: C.accent }}>
                四軸スコアとは？ →
              </Link>
            </div>
            {axisBars.map(({ leftLabel, rightLabel, leftPct }) => {
              const leftDominant = leftPct > 50
              const rightPct = 100 - leftPct
              return (
                <div key={leftLabel} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    {/* 強い側（左） */}
                    {leftDominant ? (
                      <span className="flex items-baseline gap-0.5">
                        <span className="font-black text-base leading-none" style={{ color: C.gold }}>{leftLabel[0]}</span>
                        <span className="font-bold text-base" style={{ color: C.text }}>{leftLabel.slice(1)}</span>
                        <span className="font-bold text-base tabular-nums ml-1" style={{ color: C.text }}>{leftPct}%</span>
                      </span>
                    ) : (
                      <span className="text-sm" style={{ color: C.text }}>
                        {leftLabel} <span className="tabular-nums">{leftPct}%</span>
                      </span>
                    )}
                    {/* 強い側（右） */}
                    {!leftDominant ? (
                      <span className="flex items-baseline gap-0.5">
                        <span className="font-bold text-base tabular-nums mr-1" style={{ color: C.text }}>{rightPct}%</span>
                        <span className="font-black text-base leading-none" style={{ color: C.gold }}>{rightLabel[0]}</span>
                        <span className="font-bold text-base" style={{ color: C.text }}>{rightLabel.slice(1)}</span>
                      </span>
                    ) : (
                      <span className="text-sm" style={{ color: C.text }}>
                        <span className="tabular-nums">{rightPct}%</span> {rightLabel}
                      </span>
                    )}
                  </div>
                  {/* バー */}
                  <div className="w-full h-2 rounded-full overflow-hidden flex">
                    <div className="h-full transition-all duration-700"
                      style={{ width: `${leftPct}%`, background: 'linear-gradient(135deg, #4a6e96 0%, #80acd9 40%, #9ec4e8 50%, #80acd9 60%, #4a6e96 100%)' }} />
                    <div className="h-full flex-1"
                      style={{ background: 'linear-gradient(135deg, #b08a8a 0%, #d1aeae 50%, #b08a8a 100%)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── タグライン（03の前） ── */}
        <p className="text-base italic text-center mb-8" style={{ color: C.gold }}>「{mainType.detail.tagline}」</p>

        {/* ── 03 深層分析 ── */}
        <div className="pb-10 mb-10 space-y-8" style={{ borderBottom: `1px solid ${C.borderLight}` }}>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-2xl font-black" style={{ color: C.accent }}>深層分析</span>
          </div>
          <div>
            {renderMd(mainType.detail.deepDesire)}
          </div>
          {[
            { label: '日常と夜の傾向', text: mainType.detail.features },
            { label: '相性のヒント',   text: mainType.detail.relationship },
          ].map(({ label, text }) => (
            <div key={label}>
              <p className="text-xl font-bold leading-tight mb-2" style={{ color: C.gold }}>{label}</p>
              {renderMd(text)}
            </div>
          ))}
        </div>

        {/* ── 04 あなたへのメッセージ ── */}
        <div className="pb-10 mb-10" style={{ borderBottom: `1px solid ${C.borderLight}` }}>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-2xl font-black" style={{ color: C.accent }}>あなたへのメッセージ</span>
          </div>
          {renderMd(mainType.detail.closing)}
        </div>

        {/* ── 05 さいごに ── */}
        <div className="pb-10 mb-10" style={{ borderBottom: `1px solid ${C.borderLight}` }}>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-2xl font-black" style={{ color: C.accent }}>さいごに</span>
          </div>
          {renderMd(`この診断ツールは、現在の嗜好の傾向を見ていくものです。\n\n嗜好を決めつけられるものではありませんし、変化もします。\n\nまた、すべての嗜好を網羅しているわけではありません。ある診断結果が出たからと言って、解説されているもののすべてが当てはまるわけでもありません。\n\n実際に行為を行う際は、目の前にいる相手を見つめ、何が好きで何が嫌いなのかを理解しあうこと、そして明確に同意を取りあうことを忘れないでください。`)}
        </div>

        {/* シェアボタン or 診断するボタン */}
        {isFromShare ? (
          <Link
            href="/shindan"
            className="block w-full py-8 rounded-2xl text-center font-bold text-2xl transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #f5d98b 50%, #c9a84c 100%)', color: '#fff', textShadow: '0 0 8px rgba(0,0,0,0.6), 1px 1px 0 rgba(0,0,0,0.4)', boxShadow: '0 0 32px rgba(201,168,76,0.5)' }}
          >
            私も診断する
          </Link>
        ) : (
          <ShareButton
            typeCode={mainType.code}
            typeName={mainType.name}
            description={mainType.description}
            rarity={rarity}
            url={pageUrl}
            axisScores={axisScores}
          />
        )}
      </section>

      {/* ━━━ フィードバック（別枠） ━━━ */}
      {!isFromShare && (
        <div className="mt-5">
          <FeedbackForm
            typeCode={mainType.code}
            typeName={mainType.name}
            rarity={rarity}
            url={pageUrl}
            axisScores={axisScores}
            subTypeCodes={subTypes.map(t => t.code)}
            isSwitcher={isSwitcher}
            tags={tags}
            ageGroup={ageGroup}
            gender={gender}
          />
        </div>
      )}

      {/* Luna ロゴフッター */}
      <div className="flex flex-col items-center gap-3 pt-8">
        <Link href="/" className="text-base hover:opacity-70 transition-opacity" style={{ color: C.sub }}>
          ← ホームに戻る
        </Link>
        <a href="https://luna-match.com/" target="_blank" rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity">
          <Image src="/luna-logo-wide-t.png" alt="Luna" width={160} height={90} />
        </a>
        <p className="text-sm" style={{ color: C.muted }}>© Luna, Inc. All Rights Reserved.</p>
      </div>
    </div>
  )
}
