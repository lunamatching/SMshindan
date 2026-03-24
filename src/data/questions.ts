export type Axis = 'LF' | 'MB' | 'DN' | 'SP'
export type Direction = 'L' | 'F' | 'M' | 'B' | 'D' | 'N' | 'S' | 'P'

export interface AxisQuestion {
  id: string
  kind: 'axis'
  axis: Axis
  direction: Direction
  text: string
}

export interface FetishQuestion {
  id: string
  kind: 'fetish'
  text: string
  tags: string[]
  threshold: number
}

export type Question = AxisQuestion | FetishQuestion

export const AXIS_LABELS: Record<Axis, { title: string; subtitle: string }> = {
  LF: { title: '第1章：主導か服従か', subtitle: '恋愛における主導権の在り方' },
  MB: { title: '第2章：精神か肉体か', subtitle: '欲求の根源にあるもの' },
  DN: { title: '第3章：日常か非日常か', subtitle: '関係性の時間軸' },
  SP: { title: '第4章：純粋か倒錯か', subtitle: '快楽の形' },
}

// ── 軸設問（21問）──────────────────────────────────────────
export const axisQuestions: AxisQuestion[] = [
  // Lead or Follow（5問）
  { id: 'LF1', kind: 'axis', axis: 'LF', direction: 'L', text: '恋愛関係では自分がリードする側になりたいと思う。' },
  { id: 'LF2', kind: 'axis', axis: 'LF', direction: 'L', text: '相手に「どうしたい？」と聞かれるより、自分から「こうして」と指示を出す方が心地いい。' },
  { id: 'LF3', kind: 'axis', axis: 'LF', direction: 'L', text: '相手の行動や反応を自分の思い通りに動かせると満足感がある。' },
  { id: 'LF4', kind: 'axis', axis: 'LF', direction: 'F', text: '自分で決めるより、相手のペースに合わせる方が自然で安心する。' },
  { id: 'LF5', kind: 'axis', axis: 'LF', direction: 'F', text: '誰かに全部決めてもらって楽をしたいと思うことがよくある。' },

  // Mental or Body（6問）
  { id: 'MB1', kind: 'axis', axis: 'MB', direction: 'B', text: '肉体的な刺激が好き。' },
  { id: 'MB2', kind: 'axis', axis: 'MB', direction: 'B', text: '相手の「表情」「声の震え」「涙目」などに強く反応してしまう。' },
{ id: 'MB4', kind: 'axis', axis: 'MB', direction: 'M', text: '痛みや快感そのものより、「相手を従わせている」「従っている」という状況に興奮する。' },
  { id: 'MB5', kind: 'axis', axis: 'MB', direction: 'M', text: '言葉責めや命令、心理的な支配・服従の方が興奮する。' },
  { id: 'MB6', kind: 'axis', axis: 'MB', direction: 'M', text: '精神的なつながりだけで十分満足できる。' },

  // Day or Night（5問）
  { id: 'DN1', kind: 'axis', axis: 'DN', direction: 'N', text: '普通の生活と二人きりの時に見せる姿にギャップがあるほど魅力的である。' },
  { id: 'DN2', kind: 'axis', axis: 'DN', direction: 'D', text: '朝起きた時から夜寝るまで、相手との関係を実感していたい。' },
  { id: 'DN3', kind: 'axis', axis: 'DN', direction: 'D', text: 'ルールを日常的に適用して、24時間意識していたい。' },
  { id: 'DN4', kind: 'axis', axis: 'DN', direction: 'D', text: '相手に「今日の服装これにして」「髪型はこれにして」など日常的な指示を出したい/出されたい。' },
  { id: 'DN5', kind: 'axis', axis: 'DN', direction: 'N', text: '二人だけの特別な時間は、決められたタイミングだけで完結してほしい。' },

  // Straight or Perversion（5問）
  { id: 'SP1', kind: 'axis', axis: 'SP', direction: 'P', text: '痛みや苦痛、羞恥、特殊なシチュエーションに魅力を感じる。' },
  { id: 'SP2', kind: 'axis', axis: 'SP', direction: 'S', text: '相手を気持ちよくさせる/自分が気持ちよくなること自体が一番の目的だ。' },
  { id: 'SP3', kind: 'axis', axis: 'SP', direction: 'P', text: '普通のイチャイチャより、異常なシチュエーションの方が何倍も興奮する。' },
  { id: 'SP4', kind: 'axis', axis: 'SP', direction: 'P', text: '「泣かせる/泣かせられる」「怖がる/怖がらせる」「痛める/痛めつける」のどれかに喜びを感じる。' },
  { id: 'SP5', kind: 'axis', axis: 'SP', direction: 'P', text: '鞭・縄・拘束具を使うシーンを想像するとすごく興奮する。' },
]

// ── Fetishタグ専用設問（9問）────────────────────────────────
// すべて score >= 1（まあ当てはまる以上）で即時判定
export const fetishQuestions: FetishQuestion[] = [
  // 道具系（3問）
  {
    id: 'FT1',
    kind: 'fetish',
    text: '縄や鞭などの道具そのものにとても興味がある。',
    tags: ['縄・鞭'],
    threshold: 1,
  },
  {
    id: 'FT2',
    kind: 'fetish',
    text: 'レザーやラテックスの感触に強く惹かれる。',
    tags: ['レザー・ラテックス'],
    threshold: 1,
  },
  {
    id: 'FT3',
    kind: 'fetish',
    text: '拘束具やSMグッズを見ているだけでドキドキする・買いたくなる。',
    tags: ['SMグッズ'],
    threshold: 1,
  },
  // 人体系（3問）
  {
    id: 'FT4',
    kind: 'fetish',
    text: '相手の汗や唾液などに触れることを想像する。',
    tags: ['体液'],
    threshold: 1,
  },
  {
    id: 'FT5',
    kind: 'fetish',
    text: '相手の身体の匂いに異常なほど興奮する。',
    tags: ['匂い'],
    threshold: 1,
  },
  {
    id: 'FT6',
    kind: 'fetish',
    text: '特定の身体の部位（足首、手首、首筋など）を舐めたり触ったりするだけで満足度がすごく高い。',
    tags: ['ボディパーツ'],
    threshold: 1,
  },
  // モラル系（3問）
  {
    id: 'FT7',
    kind: 'fetish',
    text: '性的なことを人に見られるかもしれない状況や、第三者に知られるリスクに興奮を覚える。',
    tags: ['露出'],
    threshold: 1,
  },
  {
    id: 'FT8',
    kind: 'fetish',
    text: 'パートナーが他の人と関係を持つ想像で興奮することがある。',
    tags: ['NTR'],
    threshold: 1,
  },
  {
    id: 'FT9',
    kind: 'fetish',
    text: '自分が他の人と関係を持っている姿をパートナーに見せたいと考える。',
    tags: ['NTR'],
    threshold: 1,
  },
]

// ── 全設問（29問：axis20 + fetish9）──────────────────────────────────────────
export const allQuestions: Question[] = [...axisQuestions, ...fetishQuestions]

export const LIKERT_OPTIONS = [
  { label: 'とても当てはまる', value: 2 },
  { label: 'まあ当てはまる', value: 1 },
  { label: 'どちらでもない', value: 0 },
  { label: 'あまり当てはまらない', value: -1 },
  { label: '全く当てはまらない', value: -2 },
]
