# Crowd Data Dashboard - 実装ガイドライン

## 0. Decision Policy（判断優先度）

実装時の判断優先順位:

1. **AC（受け入れ基準）** - 機能要件の完全な実装
2. **セキュリティ** - 入力検証、認可、秘密情報保護
3. **可読性** - 保守性とコードの明確性
4. **パフォーマンス** - Core Web Vitals とユーザー体験
5. **A11y（アクセシビリティ）** - WCAG 2.2 AA 準拠
6. **DX（開発者体験）** - 開発効率と生産性

## 1. Repository Overview

### 技術スタック

- **Framework**: Next.js 15.5.2 (App Router + Turbopack)
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4 + CSS Variables
- **Component Library**: Radix UI + shadcn/ui
- **State Management**: なし（必要に応じて Zustand 推奨）
- **Testing**: 未設定（Jest + Testing Library 推奨）

### ビルドとコマンド

```bash
npm run dev         # Next.js開発サーバー（Turbopack）
npm run build       # 本番ビルド（Turbopack）
npm run start       # 本番サーバー起動
npm run lint        # ESLint実行
npm run typecheck   # TypeScript型チェック
```

### 起動手順

1. 依存関係インストール: `npm install`
2. 開発サーバー起動: `npm run dev`
3. ブラウザで http://localhost:3000 にアクセス

## 2. Directory & Import Aliases

### ディレクトリ構造

```
src/
├── app/              # Next.js App Router（ページとレイアウト）
├── components/       # UIコンポーネント
│   ├── ui/          # 基本UIコンポーネント（shadcn/ui）
│   ├── charts/      # チャート専用コンポーネント
│   └── dashboard/   # ダッシュボード固有コンポーネント
├── lib/             # ユーティリティとビジネスロジック
└── assets/          # 静的ファイル
```

### Import 規約

```typescript
// ✅ 推奨: エイリアス使用
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dataProcessor } from '@/lib/dataProcessor';

// ❌ 非推奨: 相対パス
import { Button } from '../../../components/ui/button';

// ✅ 推奨: 名前付きエクスポート
export { Button, buttonVariants };

// ❌ 非推奨: デフォルトエクスポート（ページ以外）
export default Button;
```

## 3. Figma/Code Connect 連携方針

**現状**: 未使用
**方針**: 将来的にデザインシステム統合時に導入検討

導入する場合の使用場面:

- `#get_code`: Figma コンポーネントからコード生成
- `get_code_connect_map`: デザイン-コード間のマッピング管理
- `get_variable_map`: デザイントークン同期

## 3.5 Planning with Codex（編集禁止 & 95%確信）

### 目的

実装前に要件を形式知化し、抜け漏れを潰す計画フェーズの確立

### ルール

1. **Don't edit**: 設計フェーズの Codex には「**ファイルの読み書き禁止**」を明示する
2. **Confidence 95%**: Codex は**95%の確信**に達するまで**明確化質問**を続ける
3. **Options-first**: 意思決定は**選択肢提示（a/b/c）**を基本とし、必要時のみ自由入力を促す

### プロンプト雛形

```
機能概要: [要求内容]

**DON'T WRITE OR EDIT ANY FILES**
**Ask clarifying questions until you are 95% confident.**

提案は以下の形式で：
a) [選択肢1]
b) [選択肢2]
c) [選択肢3]
d) その他（自由入力を求める）
```

### Definition of Ready（DoR）

以下を満たした設計書を「実装に渡せる状態」とする：

#### 必須項目

- **API 仕様**: エンドポイント、HTTP メソッド、ステータスコード、エラーレスポンス
- **データ/ストレージ IF**: 関数シグネチャ、権限/所有権検証、データ変換ロジック
- **キャッシュ戦略**: 無効化方針、更新タイミング、パフォーマンス最適化
- **UI/UX 仕様**:
  - モバイル/デスクトップ対応
  - 可視/非可視条件（権限、状態依存）
  - ローディング/エラー状態の表示
  - アクセシビリティ要件（ARIA、フォーカス管理）
- **E2E テスト設計**: data-testid 一覧、主要シナリオ、エラーケーステスト
- **デザイントークンマッピング**: 既存 CSS 変数への対応、ハードコード禁止の遵守
- **依存・変更箇所**: 影響範囲分析、破壊的変更の有無

#### 設計ブループリント例

```typescript
// API設計例
interface UserRegistrationAPI {
  endpoint: '/api/users/register';
  method: 'POST';
  request: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  responses: {
    201: { userId: string; message: string };
    400: { error: 'INVALID_EMAIL' | 'PASSWORD_MISMATCH' };
    409: { error: 'EMAIL_ALREADY_EXISTS' };
  };
}

// UI/UX設計例
interface RegistrationFormSpec {
  components: ['@/components/ui/input', '@/components/ui/button'];
  validation: 'real-time + submit';
  states: {
    loading: 'button disabled + spinner';
    error: 'field highlight + message below';
    success: 'redirect to /dashboard';
  };
  testIds: ['email-input', 'password-input', 'submit-button'];
}
```

## 4. Design Tokens & CSS Variables

### ハードコード禁止規則

```typescript
// ❌ 絶対禁止: ハードコード値
<div className="bg-gray-100 text-gray-900 p-4 rounded-lg">

// ✅ 必須: CSS変数使用
<div className="bg-card text-card-foreground p-4 rounded-lg">

// ❌ 禁止: 直接カラーコード
style={{ backgroundColor: '#f1f5f9' }}

// ✅ 推奨: CSS変数
style={{ backgroundColor: 'hsl(var(--card))' }}
```

### デザイントークン命名例

```css
/* カラートークン */
--background: oklch(1 0 0);
--foreground: oklch(0.145 0 0);
--primary: oklch(0.205 0 0);
--secondary: oklch(0.97 0 0);
--muted: oklch(0.97 0 0);
--accent: oklch(0.97 0 0);
--destructive: oklch(0.577 0.245 27.325);

/* スペーシング */
--radius: 0.625rem;
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);

/* チャート専用 */
--chart-1: oklch(0.646 0.222 41.116);
--chart-2: oklch(0.6 0.118 184.704);
```

### カラーマッピング表

| 用途       | Light          | Dark           | Tailwind Class    |
| ---------- | -------------- | -------------- | ----------------- |
| 背景       | `--background` | `--background` | `bg-background`   |
| 文字       | `--foreground` | `--foreground` | `text-foreground` |
| プライマリ | `--primary`    | `--primary`    | `bg-primary`      |
| カード     | `--card`       | `--card`       | `bg-card`         |
| ボーダー   | `--border`     | `--border`     | `border-border`   |

## 5. Component Usage Rules

### 既存コンポーネント優先原則

```typescript
// ✅ 必須: 既存UIコンポーネント使用
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// ❌ 禁止: 独自実装
const CustomButton = () => <button>...</button>;
```

### Props 命名規約

```typescript
// ✅ 推奨パターン
interface ComponentProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isSelected?: boolean; // boolean接頭辞
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: () => void; // イベントハンドラ
  onSubmit?: (data) => void;
  className?: string; // スタイル拡張用
  children?: React.ReactNode;
}

// ❌ 避けるべきパターン
interface BadProps {
  active: boolean; // isActiveにすべき
  disabled: boolean; // isDisabledにすべき
  click: () => void; // onClickにすべき
}
```

### バリアント語彙統一

- **variant**: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`
- **size**: `default`, `sm`, `lg`, `icon`
- **状態**: `isSelected`, `isActive`, `isLoading`, `isDisabled`

## 6. Layout Policy

### レイアウト専用コンポーネント優先

```typescript
// ✅ 推奨: Flexboxレイアウト
<div className="flex items-center justify-between gap-4">
  <Button>Left</Button>
  <Button>Right</Button>
</div>

// ❌ 非推奨: 独自CSS
<div style={{ display: 'flex', justifyContent: 'space-between' }}>
```

### グリッドシステム

```typescript
// ✅ 推奨: CSS Gridユーティリティ
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// ❌ 避ける: 複雑な位置指定
<div className="absolute top-4 left-8 transform -translate-x-1/2">
```

## 6.5 Handoff & Review Loop（計画準拠レビュー）

### ワークフロー

1. **Codex**: 設計フェーズ（DoR 満了まで）
2. **Claude Code**: 実装フェーズ
3. **Codex**: git diff を**計画準拠**でレビュー
4. **Claude Code**: Blocking 問題を解消
5. **再レビュー**: Blocking = 0 で完了

### レビューの一次評価軸

**"計画との差異"** を最優先で検出：

- 設計仕様との逸脱
- UI/UX 要件からの乖離
- API 契約の変更
- テスト ID 定義との不整合
- デザイントークン使用の違反

### 拡張レビュー出力テンプレート

既存の Summary/Blocking/Non-Blocking/Tests to Add に以下を追加：

```markdown
## Code Review Summary

### ✅ Summary

[変更内容の要約: 何を実装し、どのような価値を提供するか]

### 🎯 Plan Deviations（計画逸脱）

[設計書との差異を最優先で報告]

- [ ] API 仕様変更: [具体的な差異]
- [ ] UI/UX 要件変更: [具体的な差異]
- [ ] テスト ID 不整合: [具体的な差異]
- [ ] デザイントークン違反: [具体的な差異]

### 🚫 Blocking Issues

[必須修正項目: AC 違反、セキュリティ問題、型エラー等]

- [ ] 修正項目 1
- [ ] 修正項目 2

### ⚠️ Non-Blocking Issues

[推奨修正項目: パフォーマンス、可読性、A11y 改善等]

- [ ] 改善提案 1
- [ ] 改善提案 2

### 🧪 Tests to Add

[追加すべきテスト項目]

- [ ] ユニットテスト: [機能名]
- [ ] 統合テスト: [ワークフロー名]
- [ ] A11y テスト: [対象コンポーネント]
```

### 計画準拠チェックポイント

- [ ] **API 契約遵守**: エンドポイント、レスポンス形式が設計通りか
- [ ] **UI 状態管理**: ローディング、エラー、成功状態が設計通りか
- [ ] **テスト ID 網羅**: 設計書記載の data-testid が全て実装されているか
- [ ] **アクセシビリティ**: ARIA、フォーカス管理が設計通りか
- [ ] **デザイントークン**: ハードコード値が使われていないか
- [ ] **依存関係**: 設計で特定した変更箇所以外への影響がないか

## 7. Accessibility（WCAG 2.2 AA 準拠）

### チェックリスト

- [ ] **キーボードナビゲーション**: Tab キーで全操作可能
- [ ] **フォーカス表示**: `focus-visible:ring-ring` 適用済み
- [ ] **色のコントラスト**: 4.5:1 以上（本文）、3:1 以上（UI 要素）
- [ ] **代替テキスト**: 画像に適切な `alt` 属性
- [ ] **セマンティック HTML**: 正しい見出し階層（h1→h2→h3）
- [ ] **ARIA 属性**: `aria-label`, `aria-describedby` 適切に使用
- [ ] **ライブリージョン**: 動的コンテンツに `aria-live` 設定

### 実装例

```typescript
// ✅ アクセシブルなボタン
<Button
  aria-label="データを更新"
  aria-describedby="update-help"
  className="focus-visible:ring-ring"
>
  更新
</Button>

// ✅ アクセシブルなフォーム
<form>
  <label htmlFor="date-input">日付選択</label>
  <input
    id="date-input"
    aria-describedby="date-help"
    aria-invalid={hasError}
  />
  <div id="date-help">YYYY-MM-DD形式で入力</div>
</form>
```

## 8. Performance

### Core Web Vitals 目標値

- **LCP (Largest Contentful Paint)**: < 2.5 秒
- **INP (Interaction to Next Paint)**: < 200ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### パフォーマンス原則

```typescript
// ✅ コード分割（動的インポート）
const HeavyChart = lazy(() => import('@/components/charts/heavy-chart'));

// ✅ 画像最適化
import Image from 'next/image';
<Image src="/chart-data.png" alt="データチャート" width={800} height={400} priority={isAboveFold} />;

// ✅ メモ化でレンダリング最適化
const MemoizedChart = memo(({ data }) => {
  return <Chart data={data} />;
});
```

### バンドル最適化

- Chart.js 等の重いライブラリは必要時のみインポート
- Turbopack 活用で開発時パフォーマンス最適化
- 本番ビルド前に `npm run build` でバンドルサイズ確認

## 9. Security

### 入力検証

```typescript
// ✅ 必須: 入力サニタイゼーション
import { z } from 'zod';

const DateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// ✅ CSVデータの安全な処理
import Papa from 'papaparse';
const result = Papa.parse(csvText, {
  skipEmptyLines: true,
  transform: (value) => value.trim(), // XSS対策
});
```

### 認可境界

- API Routes: 認証状態確認後にデータ返却
- Client Components: 認証状態に応じた UI 表示制御

### 秘密情報の扱い

```typescript
// ✅ 環境変数使用
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// ❌ 絶対禁止: ハードコード
const API_KEY = 'sk-1234567890abcdef';
```

## 10. Testing

### テスト境界の定義

- **ユニットテスト**: 純粋関数（lib/utils, dataProcessor）
- **統合テスト**: コンポーネント + データ処理
- **E2E テスト**: ユーザーワークフロー全体

### 推奨テストフレームワーク

```bash
# 追加予定の依存関係
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D playwright  # E2Eテスト用
```

### スナップショットテスト方針

- UI コンポーネント: プロップの組み合わせをテスト
- チャート: データ変換ロジックのみテスト（描画は除く）

### I/O 境界のスキーマ検証

```typescript
// ✅ CSV読み込み時の型安全性
const validateCrowdData = (row: unknown[]): CrowdDataRow => {
  return {
    timestamp: String(row[0]),
    count: Number(row[1]),
    location: String(row[2]),
  };
};
```

## 10.5 Testing - E2E IDs & Contract Examples

### 設計書連携テスト戦略

設計フェーズで定義された**data-testid 一覧**に沿って E2E テストを作成し、API/UI コントラクトの例を整備する。

### E2E テスト ID 管理

```typescript
// 設計書で定義されたテストID一覧例
export const TEST_IDS = {
  // ユーザー登録フォーム
  REGISTRATION: {
    EMAIL_INPUT: 'registration-email-input',
    PASSWORD_INPUT: 'registration-password-input',
    CONFIRM_PASSWORD_INPUT: 'registration-confirm-password-input',
    SUBMIT_BUTTON: 'registration-submit-button',
    ERROR_MESSAGE: 'registration-error-message',
    SUCCESS_MESSAGE: 'registration-success-message',
  },
  // ダッシュボード
  DASHBOARD: {
    DATE_PICKER: 'dashboard-date-picker',
    CHART_CONTAINER: 'dashboard-chart-container',
    REFRESH_BUTTON: 'dashboard-refresh-button',
    LOADING_SPINNER: 'dashboard-loading-spinner',
  },
} as const;
```

### API コントラクト例

各 API エンドポイントに対して最小 1 例ずつの contract example を定義：

```typescript
// ✅ API Request/Response例
export const API_CONTRACTS = {
  userRegistration: {
    // 正常ケース
    success: {
      request: {
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      },
      response: {
        status: 201,
        body: { userId: 'usr_1234567890', message: 'Registration successful' },
      },
    },
    // エラーケース
    invalidEmail: {
      request: { email: 'invalid-email', password: 'SecurePass123!', confirmPassword: 'SecurePass123!' },
      response: { status: 400, body: { error: 'INVALID_EMAIL' } },
    },
    passwordMismatch: {
      request: { email: 'test@example.com', password: 'SecurePass123!', confirmPassword: 'DifferentPass!' },
      response: { status: 400, body: { error: 'PASSWORD_MISMATCH' } },
    },
    emailExists: {
      request: { email: 'existing@example.com', password: 'SecurePass123!', confirmPassword: 'SecurePass123!' },
      response: { status: 409, body: { error: 'EMAIL_ALREADY_EXISTS' } },
    },
  },
};
```

### 認可失敗パターン例

```typescript
// 認可境界のテストケース
export const AUTH_FAILURE_CASES = {
  unauthorized: {
    request: { headers: {} }, // 認証トークンなし
    response: { status: 401, body: { error: 'UNAUTHORIZED' } },
  },
  forbidden: {
    request: { headers: { authorization: 'Bearer user_token' } }, // 権限不足
    response: { status: 403, body: { error: 'FORBIDDEN' } },
  },
  tokenExpired: {
    request: { headers: { authorization: 'Bearer expired_token' } },
    response: { status: 401, body: { error: 'TOKEN_EXPIRED' } },
  },
};
```

### E2E シナリオ例

```typescript
// Playwright E2Eテスト例
test('ユーザー登録フロー', async ({ page }) => {
  // 1. ページアクセス
  await page.goto('/register');

  // 2. フォーム入力（設計書のtestId使用）
  await page.getByTestId(TEST_IDS.REGISTRATION.EMAIL_INPUT).fill('test@example.com');
  await page.getByTestId(TEST_IDS.REGISTRATION.PASSWORD_INPUT).fill('SecurePass123!');
  await page.getByTestId(TEST_IDS.REGISTRATION.CONFIRM_PASSWORD_INPUT).fill('SecurePass123!');

  // 3. フォーム送信
  await page.getByTestId(TEST_IDS.REGISTRATION.SUBMIT_BUTTON).click();

  // 4. 成功メッセージ確認
  await expect(page.getByTestId(TEST_IDS.REGISTRATION.SUCCESS_MESSAGE)).toContainText('Registration successful');

  // 5. リダイレクト確認
  await expect(page).toHaveURL('/dashboard');
});
```

### コントラクトテスト実装

````typescript
// APIコントラクトの自動検証
describe('API Contract Tests', () => {
  test('ユーザー登録API - 正常ケース', async () => {
    const { request, response } = API_CONTRACTS.userRegistration.success

    const result = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    expect(result.status).toBe(response.status)
    expect(await result.json()).toEqual(response.body)
  })

  test('ユーザー登録API - エラーケース全網羅', async () => {
    const errorCases = [
      API_CONTRACTS.userRegistration.invalidEmail,
      API_CONTRACTS.userRegistration.passwordMismatch,
      API_CONTRACTS.userRegistration.emailExists
    ]

    for (const testCase of errorCases) {
      const result = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.request)
      })

      expect(result.status).toBe(testCase.response.status)
      expect(await result.json()).toEqual(testCase.response.body)
    }
  })
})

## 11. Storybook / Docs

**現状**: 未導入
**計画**: デザインシステム成熟時に導入

導入する場合の必須ストーリー:
```typescript
// Button.stories.ts
export default {
  title: 'UI/Button',
  component: Button,
}

export const Default = {
  args: { children: 'ボタン' }
}

export const AllVariants = {
  render: () => (
    <div className="flex gap-2">
      {['default', 'secondary', 'destructive'].map(variant => (
        <Button key={variant} variant={variant}>{variant}</Button>
      ))}
    </div>
  )
}
````

### A11y テストアドオン

- @storybook/addon-a11y でアクセシビリティ自動チェック
- Color contrast, ARIA attributes の検証

## 12. Common Pitfalls → Fixes

### 1. CSS 変数の誤用

```typescript
// ❌ よくあるミス
<div className="bg-white dark:bg-black">

// ✅ 修正
<div className="bg-background">
```

### 2. 型安全性の欠如

```typescript
// ❌ よくあるミス
const processData = (data: any) => {
  return data.map((item) => item.value);
};

// ✅ 修正
interface DataItem {
  value: number;
  timestamp: string;
}

const processData = (data: DataItem[]): number[] => {
  return data.map((item) => item.value);
};
```

### 3. レンダリングパフォーマンス

```typescript
// ❌ よくあるミス: 毎回新しいオブジェクト生成
<Chart data={data.map(item => ({ ...item, processed: true }))} />

// ✅ 修正: useMemoで最適化
const processedData = useMemo(
  () => data.map(item => ({ ...item, processed: true })),
  [data]
)
<Chart data={processedData} />
```

### 4. アクセシビリティの見落とし

```typescript
// ❌ よくあるミス
<div onClick={handleClick}>クリック可能</div>

// ✅ 修正
<button
  onClick={handleClick}
  aria-label="データ更新ボタン"
  className="focus-visible:ring-ring"
>
  クリック可能
</button>
```

## 13. Review Output Format

### レビュア出力の定型テンプレート

```markdown
## Code Review Summary

### ✅ Summary

[変更内容の要約: 何を実装し、どのような価値を提供するか]

### 🚫 Blocking Issues

[必須修正項目: AC 違反、セキュリティ問題、型エラー等]

- [ ] 修正項目 1
- [ ] 修正項目 2

### ⚠️ Non-Blocking Issues

[推奨修正項目: パフォーマンス、可読性、A11y 改善等]

- [ ] 改善提案 1
- [ ] 改善提案 2

### 🧪 Tests to Add

[追加すべきテスト項目]

- [ ] ユニットテスト: [機能名]
- [ ] 統合テスト: [ワークフロー名]
- [ ] A11y テスト: [対象コンポーネント]

### 📋 Acceptance Criteria

- [ ] 機能要件 1 完了
- [ ] 機能要件 2 完了
- [ ] エラーハンドリング実装済み
```

## 14. Checklists

### PR 作成前チェックリスト

```markdown
## 開発完了チェックリスト

### 📋 Acceptance Criteria

- [ ] 全ての機能要件が実装済み
- [ ] エラーケースのハンドリング実装
- [ ] 予期しない入力に対する適切な処理

### 🎨 UI/UX

- [ ] デザイントークン（CSS 変数）のみ使用
- [ ] ハードコード値なし
- [ ] レスポンシブ対応完了
- [ ] ダークモード対応確認済み

### ♿ Accessibility

- [ ] キーボードナビゲーション動作確認
- [ ] フォーカス表示が適切
- [ ] 色のコントラスト比準拠
- [ ] ARIA 属性適切に設定
- [ ] セマンティック HTML 使用

### 🚀 Performance

- [ ] 不要な re-render 防止（memo, useMemo 使用）
- [ ] 画像最適化（next/image 使用）
- [ ] バンドルサイズ確認済み
- [ ] Core Web Vitals 確認

### 🧪 Testing

- [ ] ユニットテスト追加・更新
- [ ] 統合テスト実行確認
- [ ] エッジケースのテスト追加

### 🔐 Security

- [ ] 入力値のサニタイゼーション実装
- [ ] XSS 対策済み
- [ ] 認可チェック実装
- [ ] 環境変数で秘密情報管理

### 📚 Documentation

- [ ] README 更新（新機能追加時）
- [ ] コンポーネントの TSDoc 追加
- [ ] 破壊的変更の場合は CHANGELOG 更新

### 🔧 Technical

- [ ] `npm run typecheck` 成功
- [ ] `npm run lint` 成功
- [ ] `npm run build` 成功
- [ ] git commit 前の pre-commit hook 成功
```

### Code Review チェックリスト（レビュアー用）

```markdown
## レビューチェックリスト

### 🎯 Business Logic

- [ ] AC に対する実装が完全か
- [ ] エッジケースの処理が適切か
- [ ] エラーハンドリングが十分か

### 🏗️ Architecture

- [ ] 適切なディレクトリに配置されているか
- [ ] 既存パターンとの一貫性があるか
- [ ] 適切な責務分離ができているか

### 💅 Code Style

- [ ] TypeScript 型定義が適切か
- [ ] 命名規約に従っているか
- [ ] 不要なコードや重複がないか

### 🔒 Security & Performance

- [ ] 入力検証が適切に実装されているか
- [ ] パフォーマンスボトルネックはないか
- [ ] セキュリティホールはないか

### ♿ Accessibility

- [ ] WCAG 2.2 AA 準拠しているか
- [ ] キーボード操作が可能か
- [ ] スクリーンリーダー対応されているか
```

## 15. Appendix

### 用語集

- **AC**: Acceptance Criteria（受け入れ基準）
- **A11y**: Accessibility（アクセシビリティ）
- **DX**: Developer Experience（開発者体験）
- **CWV**: Core Web Vitals（コアウェブバイタル）
- **XSS**: Cross-Site Scripting（クロスサイトスクリプティング）

### 参照リンク

#### 外部ドキュメント

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/v4)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Web.dev Core Web Vitals](https://web.dev/vitals/)

#### 内部ファイル

- `CLAUDE.md`: プロジェクト基本情報
- `src/app/globals.css`: デザイントークン定義
- `tailwind.config.ts`: Tailwind 設定
- `tsconfig.json`: TypeScript 設定

---

**最終更新**: 2025-09-29
**バージョン**: v1.0.0
**管理者**: Claude Code Assistant
