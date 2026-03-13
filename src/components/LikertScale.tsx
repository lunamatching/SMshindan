'use client'

import { LIKERT_OPTIONS } from '@/data/questions'

interface Props {
  value: number | undefined
  onChange: (value: number) => void
}

export default function LikertScale({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {LIKERT_OPTIONS.map((option) => {
        const isSelected = value === option.value
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              w-full py-4 px-5 rounded-xl text-sm font-medium text-left
              border transition-all duration-200
              ${isSelected
                ? 'bg-luna-gold/20 border-luna-gold text-luna-gold shadow-[0_0_16px_rgba(201,168,76,0.3)]'
                : 'bg-luna-card/50 border-luna-border text-luna-muted hover:border-luna-gold/50 hover:text-luna-text'
              }
            `}
          >
            <span className={`inline-block w-2 h-2 rounded-full mr-3 ${isSelected ? 'bg-luna-gold' : 'bg-luna-border'}`} />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
