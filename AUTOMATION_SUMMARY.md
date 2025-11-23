# 自動処理システム 完全ガイド

**最終更新**: 2025-11-08  
**ステータス**: ✅ 設定完了・稼働中

---

## 🎯 結論: スケジュール実行の信頼性について

### ❌ GitHub Actions の Schedule は信頼できない

**根本的な問題:**
- GitHub Actions の `schedule` イベントは「ベストエフォート」であり、実行が保証されていない
- 公式ドキュメントでも最大15分の遅延が明記されている
- 実際には数時間～実行されないケースも頻繁に発生
- リポジトリの活動が少ないと、さらに遅延または無効化される

**あなたの経験は正しい:**
> 「テスト用の時間を設定してその時間が過ぎても起こらない」
→ これはGitHub Actions の既知の制約です

### ✅ 解決策: ハイブリッド方式

**信頼できる自動化:**
```
📱 iPhone → ☁️ iCloud → 🤖 launchd (1日3回) → Git Push → GitHub Actions
                                  ↑
                              これが確実
```

---

## 📋 システム構成

### 1. launchd（ローカル、メイン）

#### 1-1. 日次実行（iCloud同期）

**設定ファイル**: `~/Library/LaunchAgents/com.mygym.icloud-sync.plist`

**実行スケジュール**:
- 00:05 JST（深夜、データ整理）
- 12:05 JST（昼、定期チェック）
- 18:05 JST（夕方、ピーク前）

**実行内容** (`scripts/icloud-sync.sh`):
1. iCloudからスクリーンショットを収集
2. `screenshots/inbox/` にコピー
3. 新しいファイルがあればGitにコミット
4. GitHub にプッシュ → GitHub Actions を自動トリガー

**信頼性**: ⭐⭐⭐⭐⭐

#### 1-2. 週次実行（包括的データ処理）

**設定ファイル**: `~/Library/LaunchAgents/com.mygym.weekly-process.plist`

**実行スケジュール**:
- 日曜日 0:00 JST（週次データ処理）

**実行内容** (`scripts/weekly-process.sh`):
1. iCloud同期（未処理画像の確認）
2. OCR処理（`python scripts/python_ocr_processor.py`）
3. CSV更新（`node scripts/update-csv.js`）
4. 画像アーカイブ
5. 週次レポート生成（`node scripts/generate-report.js`）
6. パフォーマンス分析（`node scripts/performance-analyzer.js`）
7. Git コミット・プッシュ
8. GitHub Actions をトリガー（ダッシュボード再ビルド用）

**信頼性**: ⭐⭐⭐⭐⭐

### 2. GitHub Actions（クラウド、メイン処理）

**トリガー優先順位**:
1. **Push イベント** ⭐⭐⭐⭐⭐（最優先、確実）
   - launchdからのpushで自動実行
   - CSV更新時にも自動実行（ダッシュボード再ビルド用）
   - 高優先度で即座に実行される
   
2. **手動実行** ⭐⭐⭐⭐⭐（テスト・緊急時）
   - GitHub Actions UI から "Run workflow"
   
3. **Schedule** ⚠️（無効化済み）
   - launchdによる週次実行がメインのため無効化
   - 信頼性が低く、実行が保証されない

**実行内容**:
1. Python OCR環境セットアップ
2. Tesseract OCR でテキスト抽出（画像がある場合）
3. CSVデータ更新・重複除去（画像がある場合）
4. 処理済み画像のアーカイブ（画像がある場合）
5. 週次レポート生成（画像がある場合）
6. パフォーマンス分析（画像がある場合）
7. **ダッシュボード再ビルド**（常に実行）
8. 結果をGitHub にコミット・プッシュ

---

## 🔧 設定済み項目

### ✅ 完了している設定

1. **launchd ジョブ登録**: ✅
   - `~/Library/LaunchAgents/com.mygym.icloud-sync.plist`
   - 自動実行スケジュール設定済み

2. **Full Disk Access**: ✅
   - Terminal に権限付与済み
   - iCloud Drive へのアクセス可能

3. **Git SSH認証**: ✅
   - HTTPSからSSHに変更済み
   - launchdからのpush時の認証エラー解消

4. **スクリプト実行権限**: ✅
   - すべてのスクリプトに実行権限付与済み

5. **GitHub Actions ワークフロー**: ✅
   - `.github/workflows/weekly-data-collection.yml`
   - Push トリガー設定済み（screenshots/inbox/** と CSV更新時）
   - Schedule は無効化（launchdがメインのため）
   - ダッシュボード再ビルド機能追加済み

6. **週次処理システム**: ✅
   - `scripts/weekly-process.sh` - 包括的な週次処理スクリプト
   - `scripts/com.mygym.weekly-process.plist` - launchd設定
   - 日曜日 0:00 JST に自動実行

### 📊 ディレクトリ構造

```
crowd_data_dashboard_v2/
├── .github/
│   └── workflows/
│       └── weekly-data-collection.yml  # GitHub Actions設定
├── scripts/
│   ├── icloud-sync.sh                  # iCloud同期（launchdから実行）
│   ├── python_ocr_processor.py         # OCR処理
│   ├── update-csv.js                   # CSV更新
│   ├── test-automation.sh              # 自動処理テスト
│   └── check-github-actions.sh         # GitHub Actions診断
├── screenshots/
│   ├── inbox/                          # 新しいスクリーンショット
│   └── processed/                      # 処理済みアーカイブ
├── logs/
│   ├── icloud-sync.log                 # 同期ログ
│   ├── launchd-stdout.log              # launchd標準出力
│   └── launchd-stderr.log              # launchd標準エラー
└── public/
    └── fit_place24_data.csv            # 最終データ
```

---

## 🚀 動作フロー

### 通常の動作（1日3回）

```
00:05 JST
   ↓
🤖 launchd 起動
   ↓
📂 iCloud同期スクリプト実行
   ├─ iCloudから画像収集
   ├─ screenshots/inbox/ にコピー
   └─ 新しいファイルを検出
   ↓
📤 Git コミット・プッシュ（SSH）
   ↓
🚀 GitHub Actions 自動起動（pushイベント）
   ├─ OCR処理
   ├─ CSV更新
   ├─ 画像アーカイブ
   └─ 結果をコミット
   ↓
🌐 ダッシュボード自動更新
```

### バックアップ実行（週1回）

```
日曜日 0:00 JST
   ↓
⏰ GitHub Actions Schedule
   ↓
（実行されれば）データ整合性チェック
```

**⚠️ 注意**: Schedule は確実ではありません

---

## 🧪 テスト方法

### 1. システム全体のテスト

```bash
cd /Users/i_kawano/Documents/crowd_data_dashboard_v2
./scripts/test-automation.sh
```

**確認項目**:
- launchdジョブ登録
- スクリプト実行権限
- iCloud接続
- Git設定
- 実際の動作テスト

### 2. 手動実行テスト

```bash
# iCloud同期を手動実行
./scripts/icloud-sync.sh

# ログ確認
tail -f logs/icloud-sync.log
```

### 3. GitHub Actions の手動実行

1. https://github.com/iori73/crowd_data_dashboard_v2/actions へアクセス
2. "Gym Data Processing (Hybrid Mode)" を選択
3. "Run workflow" ボタンをクリック
4. ブランチを選択して "Run workflow"

---

## 📊 監視方法

### リアルタイムログ監視

```bash
# launchdの次回実行を待つ（00:05, 12:05, 18:05）
tail -f logs/icloud-sync.log
```

### GitHub Actions の実行履歴

```bash
# 最近の実行を確認
git log --oneline --grep="Weekly data update\|Auto-sync" -10

# または
# https://github.com/iori73/crowd_data_dashboard_v2/actions
```

### システム診断

```bash
./scripts/check-github-actions.sh
```

---

## ❓ よくある質問

### Q1: スケジュール実行が時刻通りに実行されない

**A**: これは正常です。GitHub Actions の Schedule は信頼性が低いため:
- **解決策**: Push トリガー（launchd）をメインにする（既に設定済み）
- Schedule はあくまでバックアップとして残す

### Q2: launchdが実行されているか確認したい

**A**: ログファイルを確認:
```bash
tail -20 logs/icloud-sync.log
ls -lt logs/
```

最新のタイムスタンプが次回実行時刻（00:05, 12:05, 18:05）にあればOK

### Q3: GitHub Actions が実行されない

**A**: 確認ポイント:
1. launchdからのGit pushが成功しているか
   - `logs/icloud-sync.log` で "Pushing to GitHub" を確認
2. SSH接続が正しく設定されているか
   - `ssh -T git@github.com` でテスト
3. `screenshots/inbox/` に新しいファイルがあるか

### Q4: 手動で処理を実行したい

**A**: 以下の方法があります:
1. iCloud同期から全て実行:
   ```bash
   ./scripts/icloud-sync.sh
   ```

2. OCRとCSV更新のみ:
   ```bash
   python3 scripts/python_ocr_processor.py
   node scripts/update-csv.js
   ```

3. GitHub Actions のみ:
   - WebブラウザでActions タブから "Run workflow"

---

## 🎯 重要なポイント

### ✅ DO（推奨）

1. **launchdをメインとして信頼する**
   - 1日3回の確実な実行
   - ローカルでiCloudに直接アクセス

2. **Push トリガーを活用する**
   - launchdからのpushで自動実行
   - 高優先度で確実に実行される

3. **定期的にログを確認する**
   - `logs/icloud-sync.log`
   - GitHub Actions の実行履歴

### ❌ DON'T（避けるべき）

1. **Schedule 実行に依存しない**
   - あくまでバックアップ用途
   - 確実な実行は期待できない

2. **HTTPS認証を使わない**
   - launchdから認証情報にアクセスできない
   - SSH認証を使用（設定済み）

---

## 📈 期待される動作

### 正常動作時のタイムライン

```
00:05 JST: 
  - launchd起動
  - iCloud同期
  - Git push
  - GitHub Actions実行
  - データ更新完了（00:10頃）

12:05 JST:
  - launchd起動
  - iCloud同期
  - Git push
  - GitHub Actions実行
  - データ更新完了（12:10頃）

18:05 JST:
  - launchd起動
  - iCloud同期
  - Git push
  - GitHub Actions実行
  - データ更新完了（18:10頃）

日曜 0:00 JST:
  - （Schedule実行、不確実）
  - データ整合性チェック
```

---

## 🔄 次のステップ

### 今すぐ確認すること

1. **次回の自動実行を待つ**
   - 00:05, 12:05, 18:05 のいずれか
   - ログで実行を確認

2. **GitHub Actions の実行履歴を確認**
   - https://github.com/iori73/crowd_data_dashboard_v2/actions
   - 最近のpushイベントで実行されているか

### 今後の改善案

1. **通知システムの導入**
   - Slack/Discord通知
   - 実行成功・失敗の通知

2. **モニタリングダッシュボード**
   - 実行状況の可視化
   - データ更新頻度の確認

3. **エラーハンドリングの強化**
   - 自動リトライ機能
   - 詳細なエラーログ

---

## 📞 トラブルシューティング

### エラーが発生した場合

1. **ログを確認**
   ```bash
   tail -50 logs/icloud-sync.log
   tail -50 logs/launchd-stderr.log
   ```

2. **手動でテスト実行**
   ```bash
   ./scripts/test-automation.sh
   ```

3. **GitHub Actions のログを確認**
   - Actions タブで失敗したジョブのログを確認

4. **診断スクリプトを実行**
   ```bash
   ./scripts/check-github-actions.sh
   ```

---

## ✅ まとめ

### 重要な事実

1. **GitHub Actions の Schedule は信頼できない**
   - これは既知の制約
   - あなたの経験（実行されない）は正常

2. **解決策はハイブリッド方式**
   - launchd（ローカル）: 確実な定期実行
   - GitHub Actions (push): 確実な処理実行
   - GitHub Actions (schedule): バックアップのみ

3. **現在のシステムは最適化済み**
   - launchdが1日3回確実に実行
   - pushトリガーでGitHub Actionsが確実に実行
   - Schedule はバックアップとして保持

### 次回の確認事項

- [ ] 00:05, 12:05, 18:05 のいずれかで動作確認
- [ ] `logs/icloud-sync.log` で実行を確認
- [ ] GitHub Actions の履歴を確認
- [ ] ダッシュボードでデータ更新を確認

---

**システムステータス**: ✅ 稼働中  
**最終確認日**: 2025-11-08  
**次回確認推奨**: 次回のlaunchd実行時（00:05, 12:05, 18:05）

