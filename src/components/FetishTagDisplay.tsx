import { FETISH_TAG_CATEGORIES, getCategoryForTag } from '@/data/fetishTags'

interface Props {
  tags: string[]
}

const CATEGORY_COLORS: Record<string, string> = {
  '道具':     'bg-amber-900/40 border-amber-700/50 text-amber-300',
  '感覚美学': 'bg-rose-900/40 border-rose-700/50 text-rose-300',
  '羞恥':     'bg-purple-900/40 border-purple-700/50 text-purple-300',
  'NTR':      'bg-indigo-900/40 border-indigo-700/50 text-indigo-300',
}

const CATEGORY_LABEL_COLORS: Record<string, string> = {
  '道具':     'text-amber-400/70',
  '感覚美学': 'text-rose-400/70',
  '羞恥':     'text-purple-400/70',
  'NTR':      'text-indigo-400/70',
}

export default function FetishTagDisplay({ tags }: Props) {
  if (tags.length === 0) return null

  // カテゴリ別にグループ化
  const grouped: Record<string, string[]> = {}
  for (const tag of tags) {
    const category = getCategoryForTag(tag)
    if (!grouped[category]) grouped[category] = []
    grouped[category].push(tag)
  }

  const filledCategories = FETISH_TAG_CATEGORIES.filter((c) => grouped[c.label])

  return (
    <div className="space-y-3">
      <p className="text-luna-muted text-xs tracking-widest uppercase">Fetish Tags</p>
      {filledCategories.map((c) => (
        <div key={c.label} className="space-y-1.5">
          <p className={`text-xs font-medium ${CATEGORY_LABEL_COLORS[c.label] ?? 'text-luna-muted'}`}>
            {c.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {grouped[c.label].map((tag) => (
              <span
                key={tag}
                className={`text-xs px-3 py-1 rounded-full border ${CATEGORY_COLORS[c.label] ?? 'bg-luna-card border-luna-border text-luna-muted'}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
