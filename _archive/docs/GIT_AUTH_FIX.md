# Git認証エラーの修正手順

## 問題

```
ERROR: Permission to iori73/crowd_data_dashboard_v2.git denied to iori-kwn.
```

## 原因

SSH認証が `iori-kwn` として行われているのに、`iori73` のリポジトリにアクセスしようとしている。

---

## ✅ 解決方法: SSH鍵を iori73 アカウントに追加

### ステップ1: SSH公開鍵を確認（完了済み）

SSH公開鍵:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOK+anxAYpWrc1slfT7G/Qph8L6p58IvoUiWed7EK4i9 i_kawano@yumemi.co.jp
```

### ステップ2: GitHubに追加

1. **iori73アカウントでGitHubにログイン**
   - URL: https://github.com/settings/keys

2. **New SSH key** をクリック

3. 以下を入力：
   - **Title**: `Mac crowd_data_dashboard_v2`
   - **Key**: 上記の公開鍵全体をペースト

4. **Add SSH key** をクリック

### ステップ3: 動作確認

SSH鍵を追加したら、ターミナルで以下を実行：

```bash
# SSH認証をテスト
ssh -T git@github.com
```

**期待される出力**:
```
Hi iori73! You've successfully authenticated...
       ^^^^^^ ← iori73 になっていればOK
```

### ステップ4: Gitプッシュ

```bash
cd /Users/i_kawano/Documents/crowd_data_dashboard_v2
git push
```

**成功すれば**:
```
Enumerating objects: 235, done.
Counting objects: 100% (235/235), done.
...
To github.com:iori73/crowd_data_dashboard_v2.git
   939e4b7..1dbb858  main -> main
```

---

## 🔍 トラブルシューティング

### まだ iori-kwn と表示される場合

SSH設定で特定のアカウント用の鍵を使うように設定：

```bash
# SSH設定ファイルを編集
nano ~/.ssh/config
```

以下を追加：
```
Host github.com-iori73
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes

Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
```

保存後、SSH認証を再テスト：
```bash
ssh -T git@github.com
```

---

## 📝 重要なポイント

### user.name と user.email は関係ない

```bash
git config user.name "iori73"
git config user.email "iori730002204294@gmail.com"
```

これは**コミット署名**の設定であり、**認証（Authentication）**には影響しません。

| 設定 | 用途 |
|------|------|
| `git config user.name/email` | コミット時の署名（誰がコミットしたか） |
| **SSH鍵** | **GitHubへのアクセス権（認証）** ← 今回の問題 |

---

## ✅ チェックリスト

- [ ] iori73のGitHub Settingsを開く
- [ ] SSH公開鍵を追加
- [ ] `ssh -T git@github.com` で iori73 と表示される
- [ ] `git push` が成功する
- [ ] 明日の自動実行（launchd）が動作する

---

**最終更新**: 2025-11-23



