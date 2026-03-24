export interface FetishTagCategory {
  label: string
  tags: string[]
}

export const FETISH_TAG_CATEGORIES: FetishTagCategory[] = [
  { label: '道具', tags: ['縄・鞭', 'レザー・ラテックス', 'SMグッズ'] },
  { label: '感覚美学', tags: ['体液', '匂い', 'ボディパーツ'] },
  { label: '羞恥', tags: ['露出'] },
  { label: 'NTR', tags: ['NTR'] },
]

export function getCategoryForTag(tag: string): string {
  for (const category of FETISH_TAG_CATEGORIES) {
    if (category.tags.includes(tag)) return category.label
  }
  return '道具'
}
