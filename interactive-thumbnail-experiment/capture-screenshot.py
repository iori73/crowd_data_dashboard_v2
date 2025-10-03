#!/usr/bin/env python3
"""
ダッシュボードのスクリーンショットを自動取得するスクリプト
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def capture_dashboard_screenshot():
    """ダッシュボードのスクリーンショットを取得"""

    # スクリーンショット保存ディレクトリ
    screenshot_dir = "assets/screenshots"
    os.makedirs(screenshot_dir, exist_ok=True)

    # Chrome オプション設定
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # ヘッドレスモード
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-gpu")

    try:
        # WebDriver を初期化
        driver = webdriver.Chrome(options=chrome_options)

        print("📸 ダッシュボードのスクリーンショットを取得中...")

        # ダッシュボードにアクセス
        dashboard_url = "http://localhost:3000/dashboard"
        print(f"🌐 アクセス中: {dashboard_url}")
        driver.get(dashboard_url)

        # ページの読み込み完了を待機
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        # 追加の読み込み時間
        time.sleep(3)

        # ライトモードのスクリーンショット
        light_screenshot_path = os.path.join(screenshot_dir, "dashboard-light.png")
        driver.save_screenshot(light_screenshot_path)
        print(f"✅ ライトモードスクリーンショット保存: {light_screenshot_path}")

        # ダークモード切り替えボタンがあるかチェック
        try:
            # ダークモード切り替え要素を探す（存在すれば）
            dark_mode_toggle = driver.find_element(
                By.CSS_SELECTOR, "[data-theme='dark'], .dark-mode-toggle, .theme-toggle"
            )

            if dark_mode_toggle:
                dark_mode_toggle.click()
                time.sleep(2)  # 切り替えアニメーション待機

                # ダークモードのスクリーンショット
                dark_screenshot_path = os.path.join(
                    screenshot_dir, "dashboard-dark.png"
                )
                driver.save_screenshot(dark_screenshot_path)
                print(f"✅ ダークモードスクリーンショット保存: {dark_screenshot_path}")
        except:
            print("🌙 ダークモード切り替えボタンが見つかりません（スキップ）")

        print("🎉 スクリーンショット取得完了！")

    except Exception as e:
        print(f"❌ エラー: {e}")
        print("💡 手動でスクリーンショットを取得してください：")
        print("   1. http://localhost:3000/dashboard にアクセス")
        print("   2. スクリーンショットを撮影")
        print(f"   3. {screenshot_dir}/dashboard-light.png として保存")

    finally:
        try:
            driver.quit()
        except:
            pass


def manual_screenshot_instructions():
    """手動スクリーンショット取得の説明"""
    print("\n📝 手動スクリーンショット取得手順:")
    print("=" * 50)
    print("1. ブラウザで http://localhost:3000/dashboard にアクセス")
    print("2. ページが完全に読み込まれるまで待機")
    print("3. スクリーンショットを撮影（Cmd+Shift+4 or 画面キャプチャ）")
    print("4. 以下のパスに保存:")
    print("   📁 assets/screenshots/dashboard-light.png")
    print("5. （可能であれば）ダークモードに切り替えて同様に撮影:")
    print("   📁 assets/screenshots/dashboard-dark.png")
    print("\n💡 ヒント: 1920x1080程度の解像度で撮影することをお勧めします")


if __name__ == "__main__":
    print("🚀 Dashboard Screenshot Capture Tool")
    print("=" * 40)

    # 自動取得を試行
    try:
        capture_dashboard_screenshot()
    except ImportError:
        print("⚠️  Selenium がインストールされていません")
        print("📦 インストール: pip install selenium")
        manual_screenshot_instructions()
    except Exception as e:
        print(f"❌ 自動取得に失敗: {e}")
        manual_screenshot_instructions()
