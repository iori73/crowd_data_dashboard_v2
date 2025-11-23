# launchd権限エラーの修正手順

**問題**: launchdが「Operation not permitted」エラーで実行できない
**原因**: macOSのFull Disk Access権限が不足

---

## 🔧 修正手順

### ステップ1: Full Disk Accessを確認・設定

1. **システム設定を開く**
   ```bash
   open "x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles"
   ```

2. **または手動で開く**
   - システム設定（System Preferences）を開く
   - 「プライバシーとセキュリティ」（Privacy & Security）
   - 「フルディスクアクセス」（Full Disk Access）

3. **以下のアプリを追加**
   - `/bin/bash` を追加
   - `/usr/bin/python3` を追加（Python OCR処理用）
   - `/usr/local/bin/node` を追加（Node.js処理用）

### ステップ2: launchdプロセスを再起動

```bash
# 現在のプロセスをアンロード
launchctl unload ~/Library/LaunchAgents/com.mygym.weekly-process.plist
launchctl unload ~/Library/LaunchAgents/com.mygym.icloud-sync.plist

# 再ロード
launchctl load ~/Library/LaunchAgents/com.mygym.weekly-process.plist
launchctl load ~/Library/LaunchAgents/com.mygym.icloud-sync.plist

# ステータス確認
launchctl list | grep mygym
```

**期待される結果**:
```
-	0	com.mygym.icloud-sync
-	0	com.mygym.weekly-process
```
（0 = 正常、126 = 権限エラー）

### ステップ3: 手動テスト実行

```bash
# 週次処理スクリプトを手動実行してテスト
cd /Users/i_kawano/Documents/crowd_data_dashboard_v2
bash scripts/weekly-process.sh
```

**正常に実行されれば**:
- `logs/weekly-process-stdout.log` にログが記録される
- inboxの画像が処理される
- CSVが更新される

### ステップ4: ログの確認

```bash
# エラーログを確認
tail -20 logs/weekly-process-stderr.log

# 実行ログを確認
tail -20 logs/weekly-process-stdout.log
```

---

## 🚨 代替案: スクリプトを別の場所に移動

もしFull Disk Accessが設定できない場合、スクリプトをDocumentsフォルダから移動：

```bash
# ホームディレクトリに専用フォルダを作成
mkdir -p ~/gym-automation
cp -r /Users/i_kawano/Documents/crowd_data_dashboard_v2 ~/gym-automation/

# launchd設定を更新して再ロード
# （plistファイルのパスを ~/gym-automation/... に変更）
```

---

## ✅ 確認方法

### 1. launchdステータス確認
```bash
launchctl list | grep mygym
```
→ **0** が表示されればOK（126はNG）

### 2. 次回の実行予定確認
```bash
launchctl print gui/$(id -u)/com.mygym.weekly-process
```

### 3. 手動実行テスト
```bash
launchctl start com.mygym.weekly-process
```

すぐに実行され、ログが出力されればOK

---

## 📋 まとめ

**問題**: macOSのセキュリティ制限
**解決**: Full Disk Accessを付与
**確認**: ステータスコードが 0 になる

**実行スケジュール**: 毎週日曜日 0:00 JST

