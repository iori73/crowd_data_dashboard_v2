# My Gym 混雑状況ダッシュボード v2

ジムの混雑状況を可視化するダッシュボードアプリケーションです。  
iPhone ショートカットアプリで自動収集したスクリーンショットをOCR処理し、データを抽出・可視化します。

## 🚀 主な機能

- **自動データ収集**: iPhone ショートカットアプリによるスクリーンショット自動取得
- **OCR処理**: EasyOCR + Tesseract による高精度テキスト抽出  
- **データ可視化**: 曜日別・時間別の混雑状況をグラフで表示
- **統計分析**: 平均利用者数、ピーク時間、最も空いている時間を自動計算
- **GitHub Actions**: 週次自動実行によるメンテナンスフリー運用
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

### iPhone連携
- **ショートカットアプリ** (スクリーンショット自動取得)
- **iCloud Drive** (ファイル同期)

## 📱 システム構成

```
iPhone ショートカット → iCloud Drive → GitHub Actions → Python OCR → CSV → Next.js ダッシュボード
```

1. **iPhone**: ショートカットアプリが定期的にMy Gymアプリのスクリーンショットを取得
2. **iCloud**: スクリーンショットがiCloud Driveに自動保存
3. **GitHub Actions**: 週次でPython OCRスクリプトを実行
4. **OCR処理**: EasyOCR/Tesseractで人数・混雑状況・時刻を抽出
5. **データ更新**: 抽出データをCSVファイルに追加
6. **ダッシュボード**: Next.jsアプリでデータを可視化

## 🛠️ セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Python環境のセットアップ

```bash
pip install -r requirements.txt
```

### 3. iPhone ショートカットの設定

1. ショートカットアプリでMy Gymスクリーンショット取得ショートカットを作成
2. 保存先を以下のパスに設定:
   ```
   iCloud Drive/Shortcuts/My_Gym/
   ```
3. 自動実行スケジュールを設定

### 4. iCloudパスの確認

OCRスクリプトは以下のパスからスクリーンショットを取得します:
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

### 手動OCR処理

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
- My Gymアプリの混雑状況画面
- ファイル名形式: `FP24_YYYYMMDD_HHMMSS.png`

### 出力データ (CSV)
```csv
datetime,date,time,hour,weekday,count,status_label,status_code,status_min,status_max,raw_text
2025-01-15T10:30:00,2025-01-15,10:30,10,Wednesday,12,やや空いています（~20人）,4,11,20,"12人 やや空いています"
```

## 🤖 自動化

### GitHub Actions
`.github/workflows/weekly-data-collection.yml`

- **実行頻度**: 毎週日曜日 JST 23:00
- **処理内容**:
  1. Python環境セットアップ
  2. OCR依存関係インストール  
  3. スクリーンショット処理
  4. データ抽出・CSV更新
  5. 結果のコミット

### OCR処理フロー
1. iCloudからスクリーンショット収集
2. 画像前処理（ノイズ除去、コントラスト強化）
3. EasyOCR実行（第一選択）
4. Tesseract実行（フォールバック）
5. 正規表現による構造化データ抽出
6. CSV形式で保存

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

### UI機能
- 日本語・英語切り替え
- ライト・ダークモード
- レスポンシブデザイン
- CSVエクスポート
- リアルタイム更新

## 📱 モバイル対応

- タッチ操作最適化
- フローティングリフレッシュボタン
- ハンバーガーメニュー
- スワイプナビゲーション

## 🔧 トラブルシューティング

### OCRが失敗する場合
1. iCloudパスが正しいか確認
2. スクリーンショットファイル名をチェック
3. Python依存関係の再インストール

### ダッシュボードが重い場合
- ブラウザキャッシュをクリア
- 開発者ツールでネットワークタブを確認
- データサイズをチェック

### iCloud同期エラー
- iCloud Driveの同期状況を確認
- ショートカットアプリの権限設定をチェック

## 📈 今後の改善予定

- [ ] リアルタイム通知機能
- [ ] 予測モデルの導入
- [ ] API化対応
- [ ] PWA対応
- [ ] 他のジム対応

## 🔒 プライバシー

- 個人情報は一切収集しません
- 混雑状況の数値データのみを処理
- ローカル処理中心でクラウドサービス最小限

## 📄 ライセンス

MIT License

## 🙋‍♂️ サポート

Issues・Pull Requestをお気軽にお送りください。

---

**無料で運用できる混雑状況可視化システム** 📊✨