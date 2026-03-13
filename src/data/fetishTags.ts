export interface FetishTagCategory {
  label: string
  tags: string[]
}

export const FETISH_TAG_CATEGORIES: FetishTagCategory[] = [
  { label: '道具', tags: ['縄', '鞭', 'レザーやラバー', '蝋燭', '手錠', 'マミー'] },
  { label: '感覚美学', tags: ['体液', '声', '匂い', '人間の部位', '血', 'くすぐり', '首絞め'] },
  { label: '羞恥', tags: ['露出', '羞恥', '落書き'] },
  { label: 'NTR', tags: ['NTR'] },
]

export function getCategoryForTag(tag: string): string {
  for (const category of FETISH_TAG_CATEGORIES) {
    if (category.tags.includes(tag)) return category.label
  }
  return '道具'
}
