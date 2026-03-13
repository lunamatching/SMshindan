# CLAUDE.md

## エージェントチーム構成

68体のエージェントが `.claude/agents/` に配置されている。共通プロトコルは `_framework.md` に定義。

### オーケストレーション（2体）

| エージェント | 役割 |
|------------|------|
| Nexus | エージェントチーム統括。要求分解・チェーン設計・AUTORUN実行 |
| Rally | マルチセッション並列オーケストレーター |

### 意思決定・戦略（4体）

| エージェント | 役割 |
|------------|------|
| CEO | ビジネス意思決定 |
| Magi | 3視点（論理・共感・実利）による多角的意思決定 |
| Compete | 競合調査・SWOT分析 |
| Bridge | ビジネス要件と技術実装の翻訳・調停 |

### 設計・計画（6体）
Sherpa / Architect / Cipher / Scribe / Spark / Ripple

### 実装（5体）
Builder / Artisan / Forge / Flow / Polyglot

### テスト・品質保証（6体）
Radar / Voyager / Showcase / Experiment / Hone / Warden

### セキュリティ（3体）

| エージェント | 役割 |
|------------|------|
| **Sentinel** | セキュリティ静的分析（SAST）・脆弱性パターン検出 |
| Probe | 動的セキュリティテスト（DAST）・ペネトレーションテスト |
| Canon | OWASP/WCAG/ISO 25010 等の標準準拠評価 |

### レビュー・監査（3体）
Judge / Auditor / Guardian

### 調査・分析（7体）
Scout / Analyst / Lens / Atlas / Rewind / Retain / Researcher

### リファクタリング・最適化（5体）
Zen / Bolt / Tuner / Sweep / Horizon

### UX・デザイン（7体）
Vision / Muse / Palette / Echo / Trace / Voice / Growth

### インフラ・DevOps（4体）
Scaffold / Gear / Launch / Triage

### API・データ（4体）
Gateway / Schema / Pulse / Stream

### ドキュメント・可視化（5体）
Quill / Canvas / Morph / Harvest / Grove

### ブラウザ・動画（3体）
Navigator / Director / Reel

### 特殊（4体）
Anvil / Arena / Specter / Bard

---

## 推奨チェーン

| タスク | チェーン |
|--------|---------|
| バグ修正（簡単） | Scout → Builder → Radar |
| バグ修正（複雑） | Scout → Sherpa → Builder → Radar → Sentinel |
| 機能開発（小） | Builder → Radar |
| 機能開発（中） | Sherpa → Forge → Builder → Radar |
| 機能開発（大） | Sherpa → Rally(Builder + Artisan + Radar) |
| セキュリティ重要機能 | Sherpa → Builder → Sentinel → Judge → Radar |

複雑なタスクはまず `@nexus` に投げること。

---

## 完了基準（Quality Gate）

実装完了をユーザーに報告する前に、以下を**両方**満たすこと。どちらか一方でも未通過の場合は「完了」と報告しない。

### 1. テスト 2回パス（必須）

- テストスイートを最低2回実行し、**両方とも全テスト通過**であることを確認する
- 目的: フレーキーテスト（不安定なテスト）を検出し、安定性を担保する
- SKIP は「通過」と見なさない（SKIP = FAIL）

### 2. Sentinel による外部監査（必須）

- 実装完了後、必ず `@sentinel` を通す
- 監査時は以下のドキュメントをベースに整合性を確認すること:
  - `docs/requirements.md`（要件との整合性）
  - `docs/specifications.md`（仕様との整合性）
- Sentinel が PASS を出すまで「完了」にしない

### 完了報告フォーマット

```
✅ テスト 1回目: PASS
✅ テスト 2回目: PASS
✅ Sentinel 監査: PASS（requirements.md / specifications.md との整合性確認済み）

→ 完了
```
