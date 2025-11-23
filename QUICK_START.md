# 🚀 クイックスタート: 自動処理の確認

**所要時間**: 2分

---

## ✅ すでに設定完了している項目

- ✅ launchd ジョブ登録（1日3回: 00:05, 12:05, 18:05）
- ✅ Full Disk Access 許可
- ✅ Git SSH認証設定
- ✅ GitHub Actions ワークフロー
- ✅ すべてのスクリプト実行権限

**👉 すでに自動化は稼働中です！**

---

## 📊 次回実行までに確認すること

### 1. 次回のlaunchd実行時刻を確認

次の時刻まで待ちます:
- 00:05 JST（深夜）
- 12:05 JST（昼）
- 18:05 JST（夕方）

### 2. リアルタイムでログを監視（オプション）

```bash
cd /Users/i_kawano/Documents/crowd_data_dashboard_v2
tail -f logs/icloud-sync.log
```

実行時刻になると、以下のような出力が表示されます:
```
[2025-11-08 12:05:00] 🔄 Starting iCloud sync process...
[2025-11-08 12:05:01] 📊 Files in inbox before sync: XX
[2025-11-08 12:05:02] 📋 Copying new file: XXX.png
[2025-11-08 12:05:05] 📤 Pushing to GitHub to trigger Actions...
[2025-11-08 12:05:10] ✅ iCloud sync process completed successfully
```

### 3. GitHub Actions の実行を確認

実行後（5-10分以内）に以下を確認:

**ブラウザで確認:**
https://github.com/iori73/crowd_data_dashboard_v2/actions

**コマンドラインで確認:**
```bash
git pull
git log --oneline -5
```

最新のコミットに "Weekly data update" が含まれていればOK

---

## 🧪 今すぐテストしたい場合

### オプション1: 手動で同期を実行

```bash
cd /Users/i_kawano/Documents/crowd_data_dashboard_v2
./scripts/icloud-sync.sh
```

### オプション2: システムテストを実行

```bash
cd /Users/i_kawano/Documents/crowd_data_dashboard_v2
./scripts/test-automation.sh
```

### オプション3: GitHub Actions を手動実行

1. https://github.com/iori73/crowd_data_dashboard_v2/actions
2. "Gym Data Processing (Hybrid Mode)" をクリック
3. "Run workflow" ボタン → "Run workflow"

---

## ❓ FAQ

### Q: GitHub Actions のスケジュール実行は信頼できる？

**A: いいえ、信頼できません。**

- Schedule実行は「ベストエフォート」
- 遅延や実行されないことが頻繁にある
- **解決済み**: launchdによるpushトリガーをメインにしています

### Q: 自動化は本当に動いている？

**A: はい、動いています。**

確認方法:
```bash
# 最近の自動実行を確認
git log --oneline --grep="Weekly data update\|Auto-sync" -10
```

### Q: 何か問題が起きたら？

**A: 以下の順番で確認:**

1. ログを確認
   ```bash
   tail -50 logs/icloud-sync.log
   ```

2. システムテストを実行
   ```bash
   ./scripts/test-automation.sh
   ```

3. 診断スクリプトを実行
   ```bash
   ./scripts/check-github-actions.sh
   ```

---

## 📈 期待される動作

```
📱 iPhone が自動でスクリーンショット取得
    ↓
☁️ iCloud に自動保存
    ↓
🤖 launchd が1日3回自動実行
    ├─ 00:05 JST
    ├─ 12:05 JST
    └─ 18:05 JST
    ↓
📂 新しいファイルを検出・コミット
    ↓
📤 GitHub に自動プッシュ（SSH）
    ↓
🚀 GitHub Actions が自動起動
    ├─ OCR処理
    ├─ CSV更新
    └─ アーカイブ
    ↓
🌐 ダッシュボードが自動更新
```

**👉 完全自動化！何もしなくてOK！**

---

## 📞 サポート

詳細なドキュメント:
- **完全ガイド**: `AUTOMATION_SUMMARY.md`
- **問題分析**: `GITHUB_ACTIONS_ANALYSIS.md`
- **システムガイド**: `docs/MASTER_SYSTEM_GUIDE.md`

---

**最終更新**: 2025-11-08  
**ステータス**: ✅ 稼働中  
**次回確認**: 次回のlaunchd実行時（00:05, 12:05, 18:05）

