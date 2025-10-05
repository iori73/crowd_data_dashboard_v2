# My Gym 混雑状況ダッシュボード v2

ジムの混雑状況を可視化するダッシュボードアプリケーションです。  
iPhone ショートカットアプリで自動収集したスクリーンショットを OCR 処理し、データを抽出・可視化します。

## 📚 **詳細ドキュメント**

**[📖 MASTER_SYSTEM_GUIDE.md](./docs/MASTER_SYSTEM_GUIDE.md)** - 完全なシステムガイド（推奨）

## 🚀 主な機能

- **自動データ収集**: iPhone ショートカットアプリによるスクリーンショット自動取得
- **OCR 処理**: Tesseract による高精度テキスト抽出 + インテリジェント・フォールバック
- **データ可視化**: 曜日別・時間別の混雑状況をグラフで表示
- **統計分析**: 平均利用者数、ピーク時間、最も空いている時間を自動計算
- **完全自動化**: launchd による1日3回の自動実行
- **レスポンシブデザイン**: PC・スマートフォン対応
- **多言語対応**: 日本語・英語切り替え可能
- **ダークモード**: ライト・ダークテーマ対応

## 🏗️ 技術スタック

### フロントエンド

- **Next.js 15** (App Router + Turbopack)
- **React 18** + TypeScript
- **Tailwind CSS** + shadcn/ui
- **Recharts** (データビジュアライゼーション)
- **date-fns** (日付処理)

### バックエンド・データ処理

- **Python OCR システム**
  - EasyOCR (日本語・英語対応)
  - Tesseract OCR (フォールバック)
  - OpenCV (画像前処理)
- **GitHub Actions** (自動実行)
- **CSV** (データストレージ)

### iPhone 連携

- **ショートカットアプリ** (スクリーンショット自動取得)
- **iCloud Drive** (ファイル同期)

## 📱 システム構成

```
iPhone ショートカット → iCloud Drive → GitHub Actions → Python OCR → CSV → Next.js ダッシュボード
```

1. **iPhone**: ショートカットアプリが定期的に My Gym アプリのスクリーンショットを取得
2. **iCloud**: スクリーンショットが iCloud Drive に自動保存
3. **GitHub Actions**: 週次で Python OCR スクリプトを実行
4. **OCR 処理**: EasyOCR/Tesseract で人数・混雑状況・時刻を抽出
5. **データ更新**: 抽出データを CSV ファイルに追加
6. **ダッシュボード**: Next.js アプリでデータを可視化

## 🛠️ セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Python 環境のセットアップ

```bash
pip install -r requirements.txt
```

### 3. iPhone ショートカットの設定

1. ショートカットアプリで My Gym スクリーンショット取得ショートカットを作成
2. 保存先を以下のパスに設定:
   ```
   iCloud Drive/Shortcuts/My_Gym/
   ```
3. 自動実行スケジュールを設定

### 4. iCloud パスの確認

OCR スクリプトは以下のパスからスクリーンショットを取得します:

```
~/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym
```

## 🚀 使用方法

### 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でダッシュボードにアクセス

### 本番ビルド

```bash
npm run build
npm run start
```

### 手動 OCR 処理

```bash
python scripts/python_ocr_processor.py
```

### データ品質チェック

```bash
npm run typecheck  # TypeScript型チェック
npm run lint       # ESLint
```

## 📊 データ形式

### 入力データ (スクリーンショット)

- My Gym アプリの混雑状況画面
- ファイル名形式: `FP24_YYYYMMDD_HHMMSS.png`

### 出力データ (CSV)

```csv
datetime,date,time,hour,weekday,count,status_label,status_code,status_min,status_max
2025-01-15T10:30:00,2025-01-15,10:30,10,Wednesday,12,やや空いています（~20人）,4,11,20
```

## 🤖 自動化

### GitHub Actions

`.github/workflows/weekly-data-collection.yml`

- **実行頻度**: 毎週日曜日 JST 23:00
- **処理内容**:
  1. Python 環境セットアップ
  2. OCR 依存関係インストール
  3. スクリーンショット処理
  4. データ抽出・CSV 更新
  5. 結果のコミット

### OCR 処理フロー

1. iCloud からスクリーンショット収集
2. 画像前処理（ノイズ除去、コントラスト強化）
3. EasyOCR 実行（第一選択）
4. Tesseract 実行（フォールバック）
5. 正規表現による構造化データ抽出
6. CSV 形式で保存

## 🎨 ダッシュボード機能

### 統計カード

- 総レコード数
- 平均利用者数
- ピーク時間（最も混雑）
- 最適時間（最も空いている）

### グラフ機能

- 曜日別・時間別混雑状況
- 線グラフ・棒グラフ切り替え
- 期間フィルター（全期間・今週・今月・先月・カスタム）

### UI 機能

- 日本語・英語切り替え
- ライト・ダークモード
- レスポンシブデザイン
- CSV エクスポート
- リアルタイム更新

## 📱 モバイル対応

- タッチ操作最適化
- フローティングリフレッシュボタン
- ハンバーガーメニュー
- スワイプナビゲーション

## 🔧 トラブルシューティング

### OCR が失敗する場合

1. iCloud パスが正しいか確認
2. スクリーンショットファイル名をチェック
3. Python 依存関係の再インストール

### ダッシュボードが重い場合

- ブラウザキャッシュをクリア
- 開発者ツールでネットワークタブを確認
- データサイズをチェック

### iCloud 同期エラー

- iCloud Drive の同期状況を確認
- ショートカットアプリの権限設定をチェック

## 📈 今後の改善予定

- [ ] リアルタイム通知機能
- [ ] 予測モデルの導入
- [ ] API 化対応
- [ ] PWA 対応
- [ ] 他のジム対応

## 🔒 プライバシー

- 個人情報は一切収集しません
- 混雑状況の数値データのみを処理
- ローカル処理中心でクラウドサービス最小限

## 📄 ライセンス

MIT License

## 🙋‍♂️ サポート

Issues・Pull Request をお気軽にお送りください。

---

**無料で運用できる混雑状況可視化システム** 📊✨
