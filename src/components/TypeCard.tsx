import { type DiagnosisType } from '@/data/types'

interface Props {
  type: DiagnosisType
  variant?: 'main' | 'sub' | 'list'
}

export default function TypeCard({ type, variant = 'list' }: Props) {
  const isLead = type.code.startsWith('L')

  if (variant === 'main') {
    return (
      <div className={`relative rounded-2xl p-8 border border-luna-gold/30 overflow-hidden ${isLead ? 'bg-type-l' : 'bg-type-f'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-luna-gold/5 to-transparent pointer-events-none" />
        <p className="text-luna-gold text-sm font-medium tracking-widest uppercase mb-2">{type.code}</p>
        <div className="text-6xl mb-4">{type.emoji}</div>
        <h2 className="text-4xl font-bold text-luna-text font-serif mb-3">{type.name}</h2>
        <p className="text-luna-muted text-base leading-relaxed">{type.description}</p>
        <div className="mt-4 inline-block bg-luna-gold/10 border border-luna-gold/30 rounded-full px-4 py-1">
          <span className="text-luna-gold text-sm">全体の {type.rarity}%</span>
        </div>
      </div>
    )
  }

  if (variant === 'sub') {
    return (
      <div className="rounded-xl p-5 border border-luna-border bg-luna-card/60">
        <p className="text-luna-muted text-xs tracking-widest uppercase mb-1">サブタイプ / {type.code}</p>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{type.emoji}</span>
          <div>
            <p className="text-luna-text font-semibold text-lg">{type.name}</p>
            <p className="text-luna-muted text-sm">{type.description.split('。')[0]}。</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl p-4 border border-luna-border bg-luna-card/40 hover:border-luna-gold/30 transition-all duration-200 ${isLead ? 'hover:bg-type-l/50' : 'hover:bg-type-f/50'}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{type.emoji}</span>
        <div>
          <span className="text-luna-gold text-xs font-mono">{type.code}</span>
          <p className="text-luna-text font-semibold text-sm">{type.name}</p>
        </div>
        <span className="ml-auto text-luna-muted text-xs">{type.rarity}%</span>
      </div>
      <p className="text-luna-muted text-xs leading-relaxed line-clamp-2">{type.description}</p>
    </div>
  )
}
