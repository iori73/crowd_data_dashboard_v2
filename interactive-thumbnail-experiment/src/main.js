// Interactive Thumbnail Implementations

class ThumbnailExperiments {
    constructor() {
        this.init()
    }

    init() {
        this.setupPositionBased()
        this.setupHoverDelay()
        this.setupClickToggle()
        this.setupClockBased()
    }

    // アプローチ1: マウス位置ベース切り替え
    setupPositionBased() {
        const thumbnail = document.getElementById('thumbnail1')
        const cursorIndicator = thumbnail.querySelector('.cursor-indicator')
        const divider = thumbnail.querySelector('.divider')
        let isHovering = false

        thumbnail.addEventListener('mouseenter', () => {
            isHovering = true
        })

        thumbnail.addEventListener('mouseleave', () => {
            isHovering = false
            thumbnail.classList.remove('dark-mode')
            cursorIndicator.style.opacity = '0'
        })

        thumbnail.addEventListener('mousemove', (e) => {
            if (!isHovering) return

            const rect = thumbnail.getBoundingClientRect()
            const x = e.clientX - rect.left
            const progress = x / rect.width

            // カーソルインジケーターの位置更新
            cursorIndicator.style.left = `${progress * 100}%`
            cursorIndicator.style.opacity = '1'

            // 60%を超えたらダークモード
            if (progress > 0.6) {
                thumbnail.classList.add('dark-mode')
            } else {
                thumbnail.classList.remove('dark-mode')
            }
        })
    }

    // アプローチ2: ホバー遅延切り替え
    setupHoverDelay() {
        const thumbnail = document.getElementById('thumbnail2')
        const icon = thumbnail.querySelector('.transition-icon')
        const title = thumbnail.querySelector('.transition-title')
        const subtitle = thumbnail.querySelector('.transition-subtitle')
        let hoverTimer = null

        thumbnail.addEventListener('mouseenter', () => {
            hoverTimer = setTimeout(() => {
                thumbnail.classList.add('transitioning')
                icon.textContent = '🌙'
                title.textContent = 'ダークモード'
                subtitle.textContent = '落ち着いた夜のダッシュボード'
            }, 1000)
        })

        thumbnail.addEventListener('mouseleave', () => {
            if (hoverTimer) {
                clearTimeout(hoverTimer)
            }
            thumbnail.classList.remove('transitioning')
            icon.textContent = '☀️'
            title.textContent = 'ライトモード'
            subtitle.textContent = '明るい朝のダッシュボード'
        })
    }

    // アプローチ3: クリック切り替え
    setupClickToggle() {
        const thumbnail = document.getElementById('thumbnail3')
        const icon = thumbnail.querySelector('.icon')
        const title = thumbnail.querySelector('h3')
        const subtitle = thumbnail.querySelector('p')
        let isDark = false

        thumbnail.addEventListener('click', () => {
            isDark = !isDark
            thumbnail.classList.toggle('dark', isDark)

            if (isDark) {
                icon.textContent = '🌙'
                title.textContent = 'ダークモード'
                subtitle.textContent = '落ち着いた夜のダッシュボード'
            } else {
                icon.textContent = '☀️'
                title.textContent = 'ライトモード'
                subtitle.textContent = '明るい朝のダッシュボード'
            }
        })

        // キーボードアクセシビリティ
        thumbnail.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                thumbnail.click()
            }
        })

        thumbnail.setAttribute('tabindex', '0')
        thumbnail.setAttribute('role', 'button')
        thumbnail.setAttribute('aria-label', 'テーマ切り替えボタン')
    }

    // アプローチ4: 時計ベースインタラクション
    setupClockBased() {
        const thumbnail = document.getElementById('thumbnail4')
        const clockHand = document.getElementById('clockHand')
        const icon = thumbnail.querySelector('.time-icon')
        const title = thumbnail.querySelector('.time-title')
        const subtitle = thumbnail.querySelector('.time-subtitle')

        thumbnail.addEventListener('mousemove', (e) => {
            const rect = thumbnail.getBoundingClientRect()
            const x = e.clientX - rect.left
            const progress = x / rect.width

            // 時計の針の角度 (0-360度)
            const angle = progress * 360
            clockHand.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`

            // 時間の計算 (6時から18時まで)
            const hour = Math.floor(6 + (progress * 12))
            const isNight = hour >= 18 || hour <= 6

            if (isNight && !thumbnail.classList.contains('night')) {
                thumbnail.classList.add('night')
                icon.textContent = '🌙'
                title.textContent = `夜 ${hour}:00`
                subtitle.textContent = 'ダークモードで集中作業'
            } else if (!isNight && thumbnail.classList.contains('night')) {
                thumbnail.classList.remove('night')
                icon.textContent = '☀️'
                title.textContent = `朝 ${hour}:00`
                subtitle.textContent = 'ライトモードで作業開始'
            } else if (!isNight) {
                title.textContent = `朝 ${hour}:00`
            } else {
                title.textContent = `夜 ${hour}:00`
            }
        })

        thumbnail.addEventListener('mouseleave', () => {
            // デフォルトの朝の状態に戻る
            clockHand.style.transform = 'translate(-50%, -100%) rotate(90deg)'
            thumbnail.classList.remove('night')
            icon.textContent = '☀️'
            title.textContent = '朝 9:00'
            subtitle.textContent = 'ライトモードで作業開始'
        })
    }
}

// スムーズなスクロール効果
class SmoothScrollEffects {
    constructor() {
        this.init()
    }

    init() {
        this.observeElements()
    }

    observeElements() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1'
                        entry.target.style.transform = 'translateY(0)'
                    }
                })
            },
            { threshold: 0.1 }
        )

        document.querySelectorAll('.experiment-section').forEach(section => {
            section.style.opacity = '0'
            section.style.transform = 'translateY(30px)'
            section.style.transition = 'all 0.6s ease'
            observer.observe(section)
        })
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    new ThumbnailExperiments()
    new SmoothScrollEffects()
    
    console.log('🎨 Interactive Thumbnail Experiments loaded!')
    console.log('📱 4つの異なるアプローチを試してみてください:')
    console.log('  1. マウス位置ベース - 左右の移動で切り替え')
    console.log('  2. ホバー遅延 - 1秒ホバーで自動切り替え') 
    console.log('  3. クリック切り替え - 明確な操作で切り替え')
    console.log('  4. 時計インタラクション - 時間の概念を使った切り替え')
})