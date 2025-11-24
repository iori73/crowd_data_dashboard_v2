# 週一の自動更新：根本原因と実行内容

**最終更新**: 2025-11-09  
**ステータス**: ✅ 解決済み（launchdベースの確実な実行に移行）

---

## 🔍 根本原因：なぜ週一の自動更新が動かなかったのか

### ❌ 根本原因

**GitHub Actions の Schedule イベントの設計上の制約**

#### 1. **「ベストエフォート」方式**

GitHub Actions の `schedule` イベントは、**実行が保証されていない**「ベストエフォート」方式です。

**公式ドキュメントの記載:**
> "Scheduled workflows run on the latest commit on the default or base branch. The shortest interval you can run scheduled workflows is once every 5 minutes. **Note: GitHub Actions does not guarantee exact execution of scheduled workflows.**"

**日本語訳:**
> 「スケジュールされたワークフローは、デフォルトブランチの最新コミットで実行されます。最短実行間隔は5分です。**注意: GitHub Actions はスケジュールされたワークフローの正確な実行を保証しません。**」

#### 2. **遅延の発生メカニズム**

```
設定時刻: 木曜日 22:05 JST
    ↓
GitHub の内部キューに追加
    ↓
【ここで遅延が発生】
    ├─ 他のワークフローの優先度が高い
    ├─ GitHub のリソースが混雑している
    ├─ リポジトリの活動が少ない（優先度が下がる）
    └─ 最大15分以上の遅延
    ↓
実行される（または実行されない）
```

#### 3. **リポジトリの活動レベルに依存**

- **活動が多いリポジトリ**: 比較的タイムリーに実行される
- **活動が少ないリポジトリ**: 遅延が大きい、または実行されない
- **60日間更新がない**: 自動的に無効化される

#### 4. **あなたの経験**

> 「今まで何回も試してきましたが、そのテスト用の時間を設定してその時間が過ぎても起こらないと言う問題が何回もありました」

**これは正常な動作です。**
- 設定ミスではありません
- あなたの環境の問題ではありません
- **GitHub 側の制約です**

---

## 📋 週一の自動更新が何をするか

### 実行内容（ワークフローの詳細）

現在の設定: **日曜日 0:00 JST**（土曜日 15:00 UTC）

#### ステップ1: 環境セットアップ

```yaml
- Checkout repository
- Setup Node.js (v20)
- Setup Python (v3.11)
- Setup Python OCR Environment
  ├─ Tesseract OCR インストール
  ├─ 日本語OCRサポート
  └─ Python依存関係インストール
```

#### ステップ2: 新しいスクリーンショットのチェック

```bash
# screenshots/inbox/ に画像があるか確認
if [ -d "screenshots/inbox" ] && [ "$(ls -A screenshots/inbox)" ]; then
    echo "new-images=true"  # 処理を続行
else
    echo "new-images=false" # 処理をスキップ
fi
```

**結果:**
- 画像がある → 次のステップへ
- 画像がない → 処理終了（「新しいデータはありませんでした」）

#### ステップ3: OCR処理（画像がある場合のみ）

```bash
python scripts/python_ocr_processor.py
```

**処理内容:**
1. `screenshots/inbox/` 内の画像を読み込み
2. Tesseract OCR でテキスト抽出
3. 人数・混雑状況・時刻を抽出
4. `scripts/extracted-data.json` に保存

**例:**
```json
{
  "processedAt": "2025-11-08T00:00:00Z",
  "totalCount": 5,
  "data": [
    {
      "filename": "FP24_20251107_1430.png",
      "count": 22,
      "status": "やや混んでいます（~30人）",
      "date": "2025-11-07",
      "time": "14:30"
    }
  ]
}
```

#### ステップ4: CSVデータ更新（画像がある場合のみ）

```bash
node scripts/update-csv.js
```

**処理内容:**
1. `scripts/extracted-data.json` を読み込み
2. 既存の `public/fit_place24_data.csv` と統合
3. 重複データを除去（datetime + count で判定）
4. 日時順にソート
5. CSVファイルを更新

**CSV形式:**
```csv
datetime,date,time,hour,weekday,count,status_label,status_code,status_min,status_max
2025-11-07 14:30:00,2025-11-07,14:30,14,Thursday,22,やや混んでいます（~30人）,3,21,30
```

#### ステップ5: 画像アーカイブ（画像がある場合のみ）

```bash
timestamp=$(date +%Y%m%d_%H%M%S)
mkdir -p screenshots/processed/$timestamp
mv screenshots/inbox/* screenshots/processed/$timestamp/
```

**処理内容:**
1. タイムスタンプ付きディレクトリを作成
   - 例: `screenshots/processed/20251108_000530/`
2. 処理済み画像をinboxから移動
3. 次回の処理で重複を防ぐ

#### ステップ6: 結果をコミット・プッシュ（変更がある場合のみ）

```bash
git add public/fit_place24_data.csv
git add screenshots/
git add scripts/extracted-data.json
git commit -m "Weekly data update 2025-11-08 00:00"
git push
```

**コミット内容:**
- 更新されたCSVファイル
- アーカイブされた画像
- 抽出データJSON

#### ステップ7: 週次レポート生成（画像がある場合のみ）

```bash
node scripts/generate-report.js
```

**生成内容:**
- 週間の統計情報
- 混雑状況の傾向
- ピーク時間の分析

#### ステップ8: パフォーマンス分析（画像がある場合のみ）

```bash
node scripts/performance-analyzer.js
```

**分析内容:**
- 処理時間の測定
- エラー率の確認
- システムの健全性チェック

#### ステップ9: サマリー表示

```bash
echo "✅ 週次データ収集処理が完了しました"
echo "📅 実行日時: 2025-11-08 00:00:00 JST"
if [ 新しいデータがあった ]; then
    echo "📊 新しいデータを処理しました"
else
    echo "📭 新しいデータはありませんでした"
fi
```

---

## 🔄 実際の動作フロー

### ケース1: 新しい画像がある場合

```
日曜日 0:00 JST
    ↓
⏰ GitHub Actions Schedule 起動（実行されれば）
    ↓
📂 screenshots/inbox/ をチェック
    ↓
✅ 画像を発見（例: 5枚）
    ↓
🤖 OCR処理
    ├─ 5枚の画像を処理
    ├─ 人数・時刻を抽出
    └─ extracted-data.json に保存
    ↓
📊 CSV更新
    ├─ 既存データと統合
    ├─ 重複除去
    └─ fit_place24_data.csv を更新
    ↓
🗃️ 画像アーカイブ
    └─ inbox → processed/20251108_000530/
    ↓
📤 Git コミット・プッシュ
    └─ "Weekly data update 2025-11-08 00:00"
    ↓
📈 週次レポート生成
    ↓
🔍 パフォーマンス分析
    ↓
✅ 完了
```

### ケース2: 新しい画像がない場合

```
日曜日 0:00 JST
    ↓
⏰ GitHub Actions Schedule 起動（実行されれば）
    ↓
📂 screenshots/inbox/ をチェック
    ↓
📭 画像なし
    ↓
⏭️ すべての処理をスキップ
    ↓
📭 "新しいデータはありませんでした"
    ↓
✅ 完了（約1分）
```

---

## ⚠️ 重要な注意点

### Schedule実行の制約

1. **実行が保証されない**
   - 設定時刻に実行されないことがある
   - 最大15分以上の遅延
   - 実行されないこともある

2. **リポジトリの活動に依存**
   - 活動が少ないと優先度が下がる
   - 60日間更新がないと無効化

3. **混雑時にスキップされる**
   - GitHub のリソースが不足すると実行されない

### なぜバックアップとして残しているか

1. **データ整合性チェック**
   - launchdが何らかの理由で失敗した場合の補完
   - 週次でのデータ確認

2. **手動実行の代替**
   - 手動で実行する手間を省く（実行されれば）

3. **完全自動化の理想**
   - 将来的に改善される可能性に備える

---

## 🎯 まとめ

### 根本原因

**GitHub Actions の Schedule イベントは「ベストエフォート」方式であり、実行が保証されていない**

- これはGitHub側の設計上の制約
- 設定ミスや環境の問題ではない
- コミュニティでも同様の問題が多数報告されている

### 週一の自動更新の役割

**バックアップとしての週次データ処理:**

1. ✅ 新しい画像のOCR処理
2. ✅ CSVデータの更新
3. ✅ 画像のアーカイブ
4. ✅ 週次レポート生成
5. ✅ パフォーマンス分析

**ただし、実行が保証されていないため、メインの実行方式（launchd + push）に依存している**

---

## 📊 解決策：launchdベースの確実な週次実行

### ✅ 実装済みの解決策

**launchdによる週次実行（信頼性: ⭐⭐⭐⭐⭐）**

```
日曜日 0:00 JST
    ↓
🤖 launchd (com.mygym.weekly-process)
    ↓
📂 scripts/weekly-process.sh 実行
    ├─ iCloud同期
    ├─ OCR処理
    ├─ CSV更新
    ├─ 画像アーカイブ
    ├─ 週次レポート生成
    ├─ パフォーマンス分析
    └─ Git コミット・プッシュ
    ↓
🚀 GitHub Actions 自動起動（pushイベント）
    ├─ ダッシュボード再ビルド
    └─ 最新データでダッシュボード更新
```

### メイン実行方式（信頼性: ⭐⭐⭐⭐⭐）

```
launchd (1日3回) → Git Push → GitHub Actions (push)
launchd (週1回) → Git Push → GitHub Actions (push + ダッシュボード再ビルド)
```

### GitHub Actions Schedule（無効化済み）

```
⚠️ GitHub Actions (schedule) - 無効化
   - 信頼性が低く、実行が保証されない
   - launchdによる週次実行がメインのため不要
```

**結論:**
- ✅ launchdによる週次実行をメインに採用
- ✅ 実行が保証される（macOSのlaunchdは信頼性が高い）
- ✅ ダッシュボードも自動的に再ビルドされる
- ✅ すべての処理が確実に実行される

---

## 📋 実装ファイル

1. **週次処理スクリプト**: `scripts/weekly-process.sh`
2. **launchd設定**: `scripts/com.mygym.weekly-process.plist`
3. **GitHub Actions**: `.github/workflows/weekly-data-collection.yml`（更新済み）

---

**最終更新**: 2025-11-09  
**ステータス**: ✅ 解決済み・実装完了

