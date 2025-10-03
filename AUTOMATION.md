# 🤖 GitHub Actions 自動化システム

## 📋 システム概要

このプロジェクトは **GitHub Actions + Claude Code OCR** を活用した完全無料の週次自動データ収集システムです。

### ✨ 特徴

- **💰 完全無料**: GitHub Actions無料枠内で動作
- **🤖 Claude Code OCR**: AI による高精度な画像データ抽出  
- **🔄 完全自動化**: 週次スケジュール実行
- **📊 リアルタイム更新**: CSVデータ自動統合・ダッシュボード反映

---

## 🚀 システムフロー

### **📱 ステップ 1: データ取得**
1. ジムアプリでスクリーンショット撮影
2. `screenshots/inbox/` ディレクトリに画像をアップロード
3. ファイル名形式: `FP24_20250915_1430.png` または `2025-09-15_14-30.png`

### **⚙️ ステップ 2: 週次自動実行**
- **実行タイミング**: 毎週日曜日 00:01 JST
- **GitHub Actions** が自動的に以下を実行:
  1. 📸 新しいスクリーンショットを検出
  2. 🤖 **Claude Code OCR** でテキスト抽出
  3. 📊 混雑データ（人数・ステータス・時刻）を解析
  4. 💾 既存CSVデータと統合・重複除去
  5. 📈 週次分析レポート自動生成
  6. 🗃️ 処理済み画像を自動アーカイブ

### **📊 ステップ 3: ダッシュボード更新**
- Next.js ダッシュボードが更新されたCSVを自動読み込み
- リアルタイムでグラフ・統計情報を更新

---

## 🛠️ セットアップ

### **前提条件**
- GitHub アカウント
- Node.js 20以上

### **初期セットアップ**

```bash
# 1. 依存関係のインストール
npm install

# 2. 開発サーバー起動
npm run dev

# 3. ブラウザでダッシュボード確認
# http://localhost:3000
```

### **自動化システムの有効化**

1. **GitHub Repository Settings** → **Actions** → **General**
2. **Workflow permissions** → **Read and write permissions** を有効
3. **Allow GitHub Actions to create and approve pull requests** を有効

これだけで設定完了！ 🎉

---

## 📁 ディレクトリ構造

```
calendar-05/
├── 📊 .github/workflows/
│   └── weekly-data-collection.yml    # GitHub Actions ワークフロー
├── 📸 screenshots/
│   ├── inbox/                        # 新規画像アップロード先
│   └── processed/                    # 処理済み画像アーカイブ
├── 🔧 scripts/
│   ├── process-screenshots.js        # Claude OCR 画像処理
│   ├── update-csv.js                # CSV データ統合
│   └── generate-report.js           # 週次レポート生成
├── 📊 public/
│   └── fit_place24_data.csv         # メインデータファイル
└── 🎨 src/                          # Next.js ダッシュボード
```

---

## 🎯 使用方法

### **日常的な使用**

1. **📱 ジム利用時**: ジムアプリのスクリーンショットを撮影
2. **📂 GitHub アップロード**: `screenshots/inbox/` に画像をアップロード
3. **⏰ 自動処理待ち**: 毎週日曜日に自動処理される
4. **📊 結果確認**: ダッシュボードで分析結果を確認

### **手動実行**

GitHub Actions で手動実行も可能：

1. **GitHub Repository** → **Actions** タブ
2. **Weekly Gym Data Collection** ワークフロー選択
3. **Run workflow** ボタンをクリック

---

## 📈 出力ファイル

### **📊 メインデータ**
- `public/fit_place24_data.csv` - ダッシュボード用統合データ

### **📄 自動生成レポート**
- `scripts/weekly-report.md` - 週次分析レポート
  - 🎯 最適利用時間帯
  - ⚠️ 混雑時間帯
  - 📅 曜日別傾向
  - 💡 おすすめアクション

### **🗃️ アーカイブ**
- `screenshots/processed/{timestamp}/` - 処理済み画像

---

## 🔧 カスタマイズ

### **実行スケジュール変更**

`.github/workflows/weekly-data-collection.yml`:

```yaml
on:
  schedule:
    # 毎週水曜日 12:00 JST に変更する場合
    - cron: '0 3 * * 3'  # UTC時刻
```

### **OCR処理のカスタマイズ**

`scripts/process-screenshots.js` でデータ抽出ロジックを調整可能:
- 正規表現パターン
- ステータス分類基準
- 日時解析ルール

---

## 💰 コスト分析

### **GitHub Actions 使用量**
- **週1回実行**: 約5-10分/回
- **月間使用量**: ~40分（無料枠2000分の2%）
- **年間コスト**: **完全無料** ✅

### **従来システムとの比較**

| 項目 | GitHub Actions版 | Vercel版 | 元Python版 |
|------|------------------|----------|-------------|
| **月額コスト** | **0円** | $20+ | 0円 |
| **運用場所** | クラウド | クラウド | ローカル |
| **OCR精度** | 高（Claude） | 中（外部API） | 中（Tesseract） |
| **メンテナンス性** | 高 | 高 | 中 |
| **拡張性** | 高 | 高 | 低 |

---

## 🛡️ セキュリティ

- **プライベートリポジトリ** 推奨
- **機密情報**: 画像にはジムの混雑状況のみ、個人情報なし
- **GitHub Actions**: 標準的なセキュリティ設定で十分

---

## ⚡ パフォーマンス

- **処理時間**: 1-3枚の画像で約2-5分
- **データサイズ**: CSV形式で軽量
- **ダッシュボード**: Next.js で高速レンダリング

---

## 🎉 完成！

このシステムにより：

- **📱 スマホ**: スクリーンショット撮影のみ
- **🤖 自動化**: 週次データ収集・分析
- **📊 ダッシュボード**: 美しい可視化
- **💰 コスト**: 完全無料

すべてが **GitHub Actions + Claude Code OCR** で自動化されます！

---

## 📞 サポート

問題やご質問があれば、GitHubのIssuesでお知らせください。

**最終更新**: 2025年9月15日
