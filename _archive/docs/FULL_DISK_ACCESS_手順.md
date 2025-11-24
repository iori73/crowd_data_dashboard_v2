# Full Disk Access 設定手順（詳細版）

## ⚠️ 重要：Finder の検索は使わない

Finder の検索では正しいファイルが見つかりません。  
**「フォルダへ移動」機能を使います。**

---

## 🔧 正しい設定手順

### ステップ 1: システム設定を開く

1. **システム設定** （System Settings / System Preferences）を開く
2. **プライバシーとセキュリティ** （Privacy & Security）をクリック
3. **フルディスクアクセス** （Full Disk Access）をクリック

### ステップ 2: 認証

- 左下の **🔒（鍵マーク）** をクリック
- パスワードを入力して認証

### ステップ 3: /bin/bash を追加

1. **+** ボタン（リストの下にある）をクリック
2. ファイル選択ダイアログが開く
3. **⌘（Command）+ Shift + G** を押す
   - または上部メニューの「移動」→「フォルダへ移動...」
4. 以下を入力して **Enter**
   ```
   /bin/bash
   ```
5. 「bash」が選択された状態になる
6. **「開く」** をクリック

### ステップ 4: /usr/bin/python3 を追加

1. 再び **+** ボタンをクリック
2. **⌘（Command）+ Shift + G** を押す
3. 以下を入力して **Enter**
   ```
   /usr/bin/python3
   ```
4. 「python3」が選択された状態になる
5. **「開く」** をクリック

### ステップ 5: node を追加（該当する方を実行）

**まず node の場所を確認：**
ターミナルで以下を実行：

```bash
which node
```

**結果が `/usr/local/bin/node` の場合：**

1. 再び **+** ボタンをクリック
2. **⌘（Command）+ Shift + G** を押す
3. 以下を入力して **Enter**
   ```
   /usr/local/bin/node
   ```
4. **「開く」** をクリック

**結果が `/opt/homebrew/bin/node` の場合：**

1. 再び **+** ボタンをクリック
2. **⌘（Command）+ Shift + G** を押す
3. 以下を入力して **Enter**
   ```
   /opt/homebrew/bin/node
   ```
4. **「開く」** をクリック

---

## ✅ 確認

フルディスクアクセスのリストに以下が追加されていれば OK：

- ✅ bash
- ✅ python3
- ✅ node

すべてのスイッチが **オン（緑色）** になっていることを確認。

---

## 🔄 次のステップ

ターミナルで以下を実行：

```bash
# launchdを再起動
launchctl unload ~/Library/LaunchAgents/com.mygym.weekly-process.plist
launchctl unload ~/Library/LaunchAgents/com.mygym.icloud-sync.plist

launchctl load ~/Library/LaunchAgents/com.mygym.weekly-process.plist
launchctl load ~/Library/LaunchAgents/com.mygym.icloud-sync.plist

# ステータス確認（0が表示されればOK、126はNG）
launchctl list | grep mygym
```

---

## 📝 ポイント

- ❌ **Finder の検索は使わない**（検索結果が多すぎて見つからない）
- ✅ **⌘ + Shift + G** で直接パスを入力する
- ✅ 完全なパス（/bin/bash など）を入力する

---

**最終更新**: 2025-11-23
