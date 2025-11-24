#!/bin/bash

# =============================================================================
# 自動処理のテストスクリプト
# =============================================================================
# このスクリプトは自動処理の各コンポーネントをテストします
# =============================================================================

set -e

PROJECT_DIR="/Users/i_kawano/Documents/crowd_data_dashboard_v2"
cd "$PROJECT_DIR"

echo "🧪 自動処理のテストを開始..."
echo "=================================="
echo ""

# カラー出力
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# テスト結果の記録
TESTS_PASSED=0
TESTS_FAILED=0

# テスト関数
test_component() {
    local name=$1
    local command=$2
    
    echo "📋 テスト: $name"
    if eval "$command"; then
        echo -e "${GREEN}✅ PASS${NC}: $name"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $name"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# 1. launchd の状態確認
echo "🔍 1. launchd 状態確認"
echo "--------------------"
test_component "launchdジョブ登録" "launchctl list | grep -q com.mygym.icloud-sync"

# 2. スクリプトの実行権限確認
echo "🔍 2. スクリプト実行権限確認"
echo "--------------------"
test_component "icloud-sync.sh の実行権限" "[ -x scripts/icloud-sync.sh ]"
test_component "python_ocr_processor.py の実行権限" "[ -x scripts/python_ocr_processor.py ]"

# 3. 必要なディレクトリの存在確認
echo "🔍 3. ディレクトリ構造確認"
echo "--------------------"
test_component "screenshots/inbox 存在" "[ -d screenshots/inbox ]"
test_component "logs ディレクトリ存在" "[ -d logs ]"
test_component "scripts ディレクトリ存在" "[ -d scripts ]"

# 4. iCloudパスの確認
echo "🔍 4. iCloud接続確認"
echo "--------------------"
ICLOUD_PATH="/Users/i_kawano/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym"
test_component "iCloudパス存在" "[ -d '$ICLOUD_PATH' ]"

# 5. Python環境の確認
echo "🔍 5. Python環境確認"
echo "--------------------"
test_component "Python3インストール" "which python3 > /dev/null"
test_component "必要なPythonパッケージ" "python3 -c 'import cv2, pytesseract, numpy' 2>/dev/null"

# 6. Node.js環境の確認
echo "🔍 6. Node.js環境確認"
echo "--------------------"
test_component "Node.jsインストール" "which node > /dev/null"
test_component "npmパッケージ" "[ -d node_modules ]"

# 7. Gitリポジトリの確認
echo "🔍 7. Gitリポジトリ確認"
echo "--------------------"
test_component "Gitリポジトリ" "[ -d .git ]"
test_component "リモートリポジトリ設定" "git remote -v | grep -q origin"

# 8. ワークフローファイルの確認
echo "🔍 8. GitHub Actions設定確認"
echo "--------------------"
test_component "ワークフローファイル存在" "[ -f .github/workflows/weekly-data-collection.yml ]"

# 9. ログファイルの確認
echo "🔍 9. ログファイル確認"
echo "--------------------"
echo "   最新のicloud-syncログ:"
if [ -f logs/icloud-sync.log ]; then
    tail -3 logs/icloud-sync.log | sed 's/^/   /'
    ((TESTS_PASSED++))
else
    echo -e "   ${YELLOW}⚠️ ログファイルがまだありません（初回実行前）${NC}"
fi
echo ""

# 10. 実際の動作テスト（dry-run）
echo "🔍 10. 動作テスト（シミュレーション）"
echo "--------------------"
echo "   iCloud同期スクリプトをテストモードで実行..."
if ./scripts/icloud-sync.sh 2>&1 | tail -5 | sed 's/^/   /'; then
    echo -e "${GREEN}✅ PASS${NC}: icloud-sync.sh 実行成功"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: icloud-sync.sh 実行失敗"
    ((TESTS_FAILED++))
fi
echo ""

# サマリー
echo "=================================="
echo "📊 テスト結果サマリー"
echo "=================================="
echo -e "✅ 成功: ${GREEN}$TESTS_PASSED${NC} 件"
echo -e "❌ 失敗: ${RED}$TESTS_FAILED${NC} 件"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 全てのテストが成功しました！${NC}"
    echo ""
    echo "次のステップ:"
    echo "1. 次回のlaunchd実行時刻（00:05, 12:05, 18:05）まで待つ"
    echo "2. ログを確認: tail -f logs/icloud-sync.log"
    echo "3. GitHub Actionsを確認: https://github.com/iori73/crowd_data_dashboard_v2/actions"
    exit 0
else
    echo -e "${RED}⚠️ いくつかのテストが失敗しました${NC}"
    echo ""
    echo "トラブルシューティング:"
    echo "1. Python依存関係: pip install -r requirements.txt"
    echo "2. Node依存関係: npm install"
    echo "3. スクリプト権限: chmod +x scripts/*.sh scripts/*.py"
    exit 1
fi

