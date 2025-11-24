# GitHub Actions スケジュール実行の問題分析

## 🔍 診断結果

### 現状確認
- ワークフローファイル: ✅ 存在（mainブランチ）
- スケジュール設定: `cron: '5 13 * * 4'` (木曜日 22:05 JST)
- 最近の実行:
  - 2025-10-24 11:46 (木曜日) - スケジュール時刻と不一致
  - 2025-10-23 22:03 (水曜日) - スケジュール時刻と不一致
  - 2025-10-20 22:27 (日曜日) - スケジュール時刻と不一致

### ❌ 問題点

**スケジュール実行は信頼できない**

GitHub Actions の `schedule` イベントには以下の既知の制約があります：

#### 1. **遅延の問題**
- 公式ドキュメントでは「最大15分の遅延」と記載
- 実際には数時間～実行されないケースも報告されている

#### 2. **実行優先度が低い**
- GitHub の内部リソースが混雑している場合、スケジュール実行は後回しにされる
- push イベントなどの他のトリガーの方が優先度が高い

#### 3. **リポジトリの活動レベルに依存**
- 活動が少ないリポジトリではさらに遅延する
- 60日間更新がないと自動的に無効化される

#### 4. **タイムゾーンの混乱**
- cronはUTC時刻で指定する必要がある
- JSTとの時差（+9時間）の計算ミスが発生しやすい

## ✅ 解決策

### 推奨アーキテクチャ：ハイブリッド方式

```
主系統（信頼性高）:
📱 iPhone → ☁️ iCloud → 🤖 launchd (1日3回) → Git Push → GitHub Actions

補助系統（バックアップ）:
⏰ GitHub Actions Schedule (週1回)
```

### 具体的な設定

#### 1. **launchd をメイン実行方式にする**

**メリット：**
- ローカルマシンで実行されるため、確実に実行される
- iCloudに直接アクセスできる
- 1日3回の実行で、よりタイムリーなデータ収集
- スケジュール実行の信頼性が高い

**設定：**
```bash
# 現在の設定（すでに設定済み）
00:05, 12:05, 18:05 JST に自動実行
```

#### 2. **GitHub Actions は pushトリガーをメインにする**

**メリット：**
- pushイベントは高優先度で実行される
- launchdからのpushで確実にトリガーされる
- OCR処理はクラウドで実行（ローカルマシンの負荷軽減）

**現在の設定（すでに正しい）：**
```yaml
on:
  push:
    paths:
      - 'screenshots/inbox/**'  # ← これがメイン
  schedule:
    - cron: '5 13 * * 4'        # ← バックアップ
  workflow_dispatch:            # ← 手動実行
```

#### 3. **スケジュール実行は補助として残す**

**用途：**
- launchdが何らかの理由で失敗した場合のバックアップ
- 週次でのデータ整合性チェック

**設定変更（日曜日 0:00 JST）：**
```yaml
schedule:
  - cron: '0 15 * * 0'  # 日曜日 15:00 UTC = 日曜日 0:00 JST
```

## 📊 実行頻度の比較

| 方式 | 実行頻度 | 信頼性 | 用途 |
|------|---------|--------|------|
| launchd | 1日3回 | ⭐⭐⭐⭐⭐ | メイン |
| GitHub Actions (push) | launchd実行時 | ⭐⭐⭐⭐⭐ | メイン |
| GitHub Actions (schedule) | 週1回 | ⭐⭐ | バックアップ |
| GitHub Actions (manual) | 手動 | ⭐⭐⭐⭐⭐ | テスト |

## 🔧 実装手順

### すぐに実施すべきこと

1. **launchd の動作確認**
   ```bash
   # 次回の実行時刻まで待つ（00:05, 12:05, 18:05）
   tail -f logs/icloud-sync.log
   ```

2. **pushトリガーのテスト**
   ```bash
   # 手動でicloud-syncを実行してpushが発生するか確認
   ./scripts/icloud-sync.sh
   ```

3. **GitHub Actions の手動実行でテスト**
   - GitHub リポジトリページへ移動
   - Actions タブ → "Gym Data Processing (Hybrid Mode)"
   - "Run workflow" ボタンをクリック

### 長期的な改善

1. **スケジュール実行を日曜日0:00に変更**
   ```yaml
   schedule:
     - cron: '0 15 * * 0'  # 日曜日 15:00 UTC
   ```

2. **実行結果の通知システム追加**
   - Slack/Discord通知を設定
   - 実行失敗時にアラートを受け取る

3. **モニタリングスクリプトの追加**
   - 定期的にGitHub Actions の実行履歴を確認
   - launchdの実行ログを監視

## 🎯 結論

**GitHub Actions のスケジュール実行は信頼できません。**

代わりに：
- **メイン**: launchd (1日3回) + GitHub Actions (pushトリガー)
- **バックアップ**: GitHub Actions (schedule, 週1回)
- **テスト**: GitHub Actions (manual)

このハイブリッド方式により、確実な自動実行が可能になります。

## 📈 期待される動作

```
00:05 JST: launchd → iCloud同期 → Git Push → GitHub Actions → データ更新
12:05 JST: launchd → iCloud同期 → Git Push → GitHub Actions → データ更新
18:05 JST: launchd → iCloud同期 → Git Push → GitHub Actions → データ更新
日曜 0:00: (バックアップ) GitHub Actions Schedule → データ確認
```

---

**最終更新**: 2025-11-08

