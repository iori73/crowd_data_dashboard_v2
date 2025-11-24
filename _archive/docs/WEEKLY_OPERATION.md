# 📅 週次運用手順

## 🎯 目的
iPhone → iCloud → GitHub → Webサイト の完全自動データパイプライン

## ⏰ 実行頻度
**週1回（推奨: 日曜日）**

## 🔧 実行手順

### 1. ターミナルを開く
```bash
cd /Users/i_kawano/Documents/crowd_data_dashboard_v2
```

### 2. iCloud同期スクリプトを実行
```bash
./scripts/icloud-sync.sh
```

### 3. 実行結果を確認
- ✅ 新しいファイルが検出・処理された場合
  - GitHub Actionsが自動起動
  - OCR処理→CSV更新→Web反映が完全自動実行

- 📭 新しいファイルがない場合
  - "No new files to sync" と表示
  - 次回まで待機

## 📊 成功の確認方法

### ローカル確認
```bash
# レコード数確認
wc -l public/fit_place24_data.csv

# 最新データ確認
tail -3 public/fit_place24_data.csv
```

### Web確認
- **GitHub Actions**: https://github.com/iori73/crowd_data_dashboard_v2/actions
- **ダッシュボード**: GitHub Pages URL

## 🚨 トラブルシューティング

### ケース1: 「Operation not permitted」エラー
**解決**: システム設定 → プライバシーとセキュリティ → Full Disk Access → Terminal を有効化

### ケース2: 新しいファイルが検出されない
```bash
# iCloud同期状況を確認
ls -la ~/Library/Mobile\ Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym/
```

### ケース3: GitHub Actionsが起動しない
- Git push が正常に完了しているか確認
- GitHub リポジトリで新しいコミットを確認

## 📈 システム状況

### 現在のデータ
- **総レコード数**: 302件
- **最新データ**: 2025-10-04 15:59
- **データ範囲**: 2025-08-31 〜 2025-10-04

### 処理能力
- **画像処理**: 75枚/回
- **OCR精度**: 高精度（Tesseract + フォールバック）
- **重複排除**: 自動実行

---

**💡 ポイント**: 一度実行すれば、後は完全自動でWebサイトまで反映されます！