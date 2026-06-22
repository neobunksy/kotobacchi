# CTOセッションメモ

最終更新：2026-06-22

---

## 現在のフェーズ

**Phase 3 完了済み** → 次は動作確認 & フィードバック対応

---

## 完了済み

### Phase 1：プロジェクト初期化（2026-06-21）
- `C:\Projects\kotobacchi` 新規作成（saiyukiとは完全独立）
- Next.js + TypeScript + Tailwind CSS 初期化
- CLAUDE.md・docs/ 構成作成
- git設定（ito.goro94@gmail.com）

### Phase 2：全画面UI実装（2026-06-21）
- ホーム画面（時間帯別背景・AIうさぎキャラクター）
- もじであそぶ（ひらがな/カタカナ/ABC + クイズ）
- おとであそぶ（ピアノ/ドラム/動物 + Web Audio API）
- おはなし（Gemini AI連携・音声認識入力）
- きせかえ（ほし消費システム）
- AIうさぎキャラクター（SVGアニメーション）
- PWA対応（manifest.json + service worker）

### Phase 3：UI改善（2026-06-21）
- 声質改善：pitch 1.5・rate 0.72・女性声優先（Kyoko/Haruka）
- 五十音グリッドを縦書きレイアウトに変更（右端から縦→左方向）
- 濁点・半濁点・小文字を個別ボタンとして配置
- おはなし画面に3タブかなキーボード追加（ひらがな/だくてん/こもじ）

### インフラ整備
- GitHubリポジトリ：github.com/neobunksy/kotobacchi
- Vercelデプロイ：https://kotobacchi.vercel.app
- 環境変数：GEMINI_API_KEY 設定済み

---

### Phase 4：AIキャラ刷新・Gemini会話強化（2026-06-21）
- AiBuddyをSVGからスプライトシートイラストに完全刷新
  - `public/characters/bunny.png`（4×6グリッド、256×256px/frame）
  - `public/characters/gorilla.png`（5×5グリッド）
  - mood別アニメ：idle/blink/happy/talking/thinking/surprised
  - まばたきランダム（3〜7秒おき・180ms）、talking時は350ms交互
- Gemini APIシステムプロンプトをひらがな専用に強化（カタカナ・漢字・記号禁止）
- 会話履歴（直近10件）をGeminiに渡す実装
- aiMood state追加（thinking→talking→idle遷移）

---

### Phase 5：キャラ6体＋お世話メカニクス＋Fire HD 8対応（2026-06-22）

- **キャラクター6体対応**：うさぎ・ゴリラ・猫・犬・ナマケモノ・モモンガ
  - うさぎ・ゴリラもSVGに統一（PNG廃止）
  - ちびポケモン風：大きな丸目＋白ハイライト・ほっぺピンクブラシ・U字口
- **時間帯×ランダム出現**：朝→うさぎ/犬、昼→猫/ゴリラ、夕→うさぎ/猫、夜→ナマケモノ/モモンガ
  - 同日は同じキャラを維持（LocalStorage `kotobacchi_today_char`）
- **お世話メカニクス**（lib/store.ts）：
  - `Needs` 型：hunger/sleepy/mood（0〜100）
  - 時間経過自動減少（hunger -10/h、sleepy -8/h、mood -5/h）
  - アクション：ごはん・ねんね・あそぶ
  - 全メーター80+で ⭐3獲得（1日1回）
- **Fire HD 8対応**：h-screen overflow-hidden で縦スクロール排除
  - メニュー縦4列 → 2×2グリッド
  - キャラサイズ140→110、余白全体圧縮

---

## 次のアクション候補

- 本番（https://kotobacchi.vercel.app）で動作確認・フィードバック対応
- アイコン画像（PWA用 icon-192.png / icon-512.png）作成
- きせかえページにキャラ選択（全6体から選べる）追加
- ゲーム開発パイプライン第1弾の企画・設計（[[project-game-pipeline]]参照）

---

## 確定済み技術構成

| 項目 | 内容 |
|------|------|
| フォルダ | C:\Projects\kotobacchi |
| GitHub | github.com/neobunksy/kotobacchi |
| Vercel | https://kotobacchi.vercel.app |
| 本番ブランチ | master |
| データ保存 | LocalStorage（DBなし） |
| AI | Gemini API（GEMINI_API_KEY） |
| 音声 | Web Speech API + Web Audio API |
| git email | ito.goro94@gmail.com |

---

## 既知の注意点

- next-pwa はNext.js 16と非互換のため削除済み。代わりに public/sw.js + ServiceWorkerRegister.tsx で対応
- コミットに Co-Authored-By を付けない（Vercelデプロイが弾かれる）
- Web Speech API・Web Audio API はSSRガード（typeof window !== 'undefined'）が必要
