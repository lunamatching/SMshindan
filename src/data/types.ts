export interface DiagnosisType {
  code: string
  name: string
  description: string
  rarity: number
  emoji: string
  compatibleCode: string
  lunaUserCount: number
}

export const diagnosisTypes: DiagnosisType[] = [
  {
    code: 'LMDS',
    name: '貴族',
    description: '日常から夜まで、相手からの奉仕を受ける。品格と威厳を持って相手を統べる、生まれながらの支配者。',
    rarity: 4,
    emoji: '👑',
    compatibleCode: 'FMDS',
    lunaUserCount: 143,
  },
  {
    code: 'LMDP',
    name: '飼い主',
    description: '普段からペットや道具扱いしたい人。愛情深く、しかし確固たる主導権で相手を手中に収める。',
    rarity: 3,
    emoji: '🐾',
    compatibleCode: 'FMDP',
    lunaUserCount: 89,
  },
  {
    code: 'LMNS',
    name: '夜の主',
    description: '相手をひたすら可愛がることで支配。プレイの時間だけに凝縮された、濃密な精神的支配者。',
    rarity: 7,
    emoji: '🌙',
    compatibleCode: 'FMNS',
    lunaUserCount: 312,
  },
  {
    code: 'LMNP',
    name: '女王様',
    description: 'スリルあるプレイで支配したい人。非日常の刺激の中に真の喜びを見出す、魅惑的な支配者。',
    rarity: 6,
    emoji: '💜',
    compatibleCode: 'FMNP',
    lunaUserCount: 278,
  },
  {
    code: 'LBNS',
    name: 'シンプルな攻め',
    description: 'バニラ。純粋な快楽と相手の喜びを最優先に。複雑な縛りより、まっすぐな愛情表現を好む。',
    rarity: 11,
    emoji: '⚡',
    compatibleCode: 'FBNS',
    lunaUserCount: 521,
  },
  {
    code: 'LBNP',
    name: 'サド',
    description: '痛みや苦痛を与えることに快感を覚える。相手の反応に真摯に向き合う、責任感の強い支配者。',
    rarity: 3,
    emoji: '🔥',
    compatibleCode: 'FBNP',
    lunaUserCount: 67,
  },
  {
    code: 'FMDS',
    name: '執事',
    description: '日常から夜まで、相手への奉仕をする。完璧な献身と忠誠心で相手を支える、誠実な従者。',
    rarity: 5,
    emoji: '🎩',
    compatibleCode: 'LMDS',
    lunaUserCount: 198,
  },
  {
    code: 'FMDP',
    name: 'ペット',
    description: '普段からペットや道具扱いされたい人。愛される存在として、相手の傍らにいることに幸福を感じる。',
    rarity: 5,
    emoji: '🐱',
    compatibleCode: 'LMDP',
    lunaUserCount: 234,
  },
  {
    code: 'FMNS',
    name: '夜の従属',
    description: '従いたい、気持ちよくなりたいさせたい人。特別な時間の中で、精神的な一体感を求める。',
    rarity: 9,
    emoji: '✨',
    compatibleCode: 'LMNS',
    lunaUserCount: 445,
  },
  {
    code: 'FMNP',
    name: '奴隷',
    description: 'スリルあるプレイで支配されたい人。非日常の緊張感の中に解放を見出す、深い信頼の体現者。',
    rarity: 7,
    emoji: '🔗',
    compatibleCode: 'LMNP',
    lunaUserCount: 389,
  },
  {
    code: 'FBNS',
    name: 'シンプルな受け',
    description: 'バニラ。相手に身を委ねることで感じる安心と幸福。純粋な愛情の交換を大切にする。',
    rarity: 14,
    emoji: '🌸',
    compatibleCode: 'LBNS',
    lunaUserCount: 678,
  },
  {
    code: 'FBNP',
    name: 'マゾ',
    description: '痛みや苦痛を受けることに快感を覚える。信頼できる相手との深い絆の中にのみ意味を見出す。',
    rarity: 4,
    emoji: '💫',
    compatibleCode: 'LBNP',
    lunaUserCount: 156,
  },
]

export function getTypeByCode(code: string): DiagnosisType | undefined {
  return diagnosisTypes.find((t) => t.code === code)
}
