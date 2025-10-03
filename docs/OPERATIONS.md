# OPERATIONS.md — 運用手順とプロンプト集

## 1. 基本運用

- **小さな修正・単発タスク** → Claude Code 単独で起動
- **大きな変更・品質保証が必要な場合** → 「相互チェックモード」を利用し、Claude Code と Codex を連携
- **レビューのみ** → Codex を単体で起動し、`GUIDELINES.md` に従ってレビューを実行

---

## 2. Claude Code 単独利用フロー

1. 修正内容を具体的に記述してプロンプトする
2. `GUIDELINES.md` の規約に従って実装
3. 差分を出力して保存
4. 自己テスト（lint / typecheck / build）を実行して終了

---

## 3. Codex 単独レビュー利用フロー

1. 対象の差分または PR を指定
2. プロンプト例：

```md
あなたはレビュアです。
./docs/GUIDELINES.md を基準に、この差分をレビューしてください。

出力形式は「Summary / Blocking Issues / Non-Blocking Issues / Tests to Add」に従ってください。
```

---

## 4. 相互チェックモード（Claude Code × Codex）

大きな修正や新機能実装のときに利用。

### 起動用プロンプト

```md
# 相互チェックモード

あなたは Claude Code（実装担当）です。  
次のタスクを実装してください。

完了後、Codex（レビュア担当）を自動で起動し、./docs/GUIDELINES.md を基準にレビューを依頼してください。

ルール：

1. Claude Code が実装
2. 差分をまとめて Codex にレビュー依頼
3. Codex が「Summary / Blocking / Non-Blocking / Tests to Add」を返す
4. Claude Code が Blocking Issues をすべて修正
5. 修正後に再度 Codex にレビュー依頼
6. Codex が「Blocking Issues なし」と判定したら終了
7. 最後に一連のやりとりを要約

タスク内容：
{ここに具体的な修正内容を記述}
```

---

## 5. 推奨ワークフローまとめ

- **単発修正** → Claude Code
- **品質レビュー** → Codex
- **重要タスク** → 相互チェックモード
