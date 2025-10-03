#!/usr/bin/env node

/**
 * 📱 リアルタイム通知システム
 * - GitHub Actions → Slack/Discord 通知
 * - 処理結果・エラー情報配信
 * - 美麗な通知フォーマット
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

class NotificationManager {
  constructor() {
    this.config = this.loadConfig();
    this.webhooks = {
      slack: process.env.SLACK_WEBHOOK_URL || this.config?.slack?.webhook,
      discord: process.env.DISCORD_WEBHOOK_URL || this.config?.discord?.webhook
    };
  }

  /**
   * 設定ファイル読み込み
   */
  loadConfig() {
    const configPath = 'scripts/notification-config.json';
    if (existsSync(configPath)) {
      try {
        return JSON.parse(readFileSync(configPath, 'utf8'));
      } catch (error) {
        console.warn('通知設定読み込みエラー:', error.message);
      }
    }
    return {};
  }

  /**
   * GitHub Actions完了通知
   */
  async sendSuccessNotification(stats) {
    const message = this.formatSuccessMessage(stats);
    await this.sendToAllChannels(message, 'success');
  }

  /**
   * エラー通知
   */
  async sendErrorNotification(error, context) {
    const message = this.formatErrorMessage(error, context);
    await this.sendToAllChannels(message, 'error');
  }

  /**
   * 処理開始通知
   */
  async sendStartNotification(fileCount) {
    const message = this.formatStartMessage(fileCount);
    await this.sendToAllChannels(message, 'info');
  }

  /**
   * 成功メッセージ フォーマット
   */
  formatSuccessMessage(stats) {
    const emoji = stats.newCount > 0 ? '🎉' : '📊';
    const timestamp = new Date().toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      slack: {
        text: `${emoji} ジムデータ処理完了`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${emoji} ジム週次データ処理完了`
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*処理日時:*\n${timestamp}`
              },
              {
                type: 'mrkdwn', 
                text: `*新規データ:*\n${stats.newCount}件`
              },
              {
                type: 'mrkdwn',
                text: `*総データ数:*\n${stats.totalCount}件`
              },
              {
                type: 'mrkdwn',
                text: `*平均混雑度:*\n${stats.avgCount}人`
              }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: stats.newCount > 0 ? 
                `✨ ${stats.newCount}件の新しいデータが正常に処理されました！\n📈 ダッシュボードが自動更新されています。` :
                `📭 新しいデータはありませんでした。次回の処理をお待ちください。`
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `🤖 GitHub Actions | 🕐 ${timestamp} JST`
              }
            ]
          }
        ]
      },
      discord: {
        embeds: [
          {
            title: `${emoji} ジムデータ処理完了`,
            color: stats.newCount > 0 ? 0x00ff00 : 0x0099ff, // 緑または青
            fields: [
              {
                name: '📅 処理日時',
                value: timestamp,
                inline: true
              },
              {
                name: '📊 新規データ',
                value: `${stats.newCount}件`,
                inline: true
              },
              {
                name: '🗂️ 総データ数',
                value: `${stats.totalCount}件`,
                inline: true
              },
              {
                name: '👥 平均混雑度',
                value: `${stats.avgCount}人`,
                inline: true
              }
            ],
            description: stats.newCount > 0 ? 
              `✨ ${stats.newCount}件の新しいデータが正常に処理されました！\n📈 ダッシュボードが自動更新されています。` :
              `📭 新しいデータはありませんでした。次回の処理をお待ちください。`,
            footer: {
              text: '🤖 Powered by GitHub Actions + Claude Code OCR'
            },
            timestamp: new Date().toISOString()
          }
        ]
      }
    };
  }

  /**
   * エラーメッセージ フォーマット
   */
  formatErrorMessage(error, context) {
    const timestamp = new Date().toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo'
    });

    return {
      slack: {
        text: '🚨 ジムデータ処理エラー',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🚨 ジムデータ処理エラー'
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*エラー発生時刻:*\n${timestamp}`
              },
              {
                type: 'mrkdwn',
                text: `*処理段階:*\n${context}`
              }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*エラー詳細:*\n\`\`\`${error.message}\`\`\``
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '🔧 *対応方法:*\n• GitHub Actions ログを確認\n• 画像ファイルの形式を確認\n• 次回の自動実行を待機'
            }
          }
        ]
      },
      discord: {
        embeds: [
          {
            title: '🚨 ジムデータ処理エラー',
            color: 0xff0000, // 赤
            fields: [
              {
                name: '⏰ エラー発生時刻',
                value: timestamp,
                inline: true
              },
              {
                name: '📍 処理段階',
                value: context,
                inline: true
              },
              {
                name: '❌ エラー詳細',
                value: `\`\`\`\n${error.message}\n\`\`\``,
                inline: false
              },
              {
                name: '🔧 対応方法',
                value: '• GitHub Actions ログを確認\n• 画像ファイルの形式を確認\n• 次回の自動実行を待機',
                inline: false
              }
            ],
            footer: {
              text: '🤖 Powered by GitHub Actions'
            },
            timestamp: new Date().toISOString()
          }
        ]
      }
    };
  }

  /**
   * 処理開始メッセージ フォーマット
   */
  formatStartMessage(fileCount) {
    const timestamp = new Date().toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo'
    });

    return {
      slack: {
        text: '🚀 ジムデータ処理開始',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `🚀 *ジムデータ処理を開始しました*\n📸 処理対象: ${fileCount}件の画像\n⏰ 開始時刻: ${timestamp}`
            }
          }
        ]
      },
      discord: {
        embeds: [
          {
            title: '🚀 ジムデータ処理開始',
            color: 0xffaa00, // オレンジ
            description: `📸 処理対象: ${fileCount}件の画像`,
            footer: {
              text: `開始時刻: ${timestamp}`
            }
          }
        ]
      }
    };
  }

  /**
   * 全チャンネルに送信
   */
  async sendToAllChannels(message, type) {
    const promises = [];

    if (this.webhooks.slack) {
      promises.push(this.sendToSlack(message.slack));
    }

    if (this.webhooks.discord) {
      promises.push(this.sendToDiscord(message.discord));
    }

    if (promises.length === 0) {
      console.log(`📢 通知 (${type}): Webhook URLが設定されていないため、コンソールに表示`);
      console.log(JSON.stringify(message, null, 2));
      return;
    }

    try {
      await Promise.all(promises);
      console.log(`✅ 通知送信完了 (${type})`);
    } catch (error) {
      console.error(`❌ 通知送信エラー (${type}):`, error.message);
    }
  }

  /**
   * Slack通知送信
   */
  async sendToSlack(payload) {
    if (!this.webhooks.slack) return;

    const response = await fetch(this.webhooks.slack, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Slack通知エラー: ${response.status}`);
    }

    console.log('📱 Slack通知送信完了');
  }

  /**
   * Discord通知送信
   */
  async sendToDiscord(payload) {
    if (!this.webhooks.discord) return;

    const response = await fetch(this.webhooks.discord, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Discord通知エラー: ${response.status}`);
    }

    console.log('💬 Discord通知送信完了');
  }
}

// 設定ファイル生成
function createNotificationConfig() {
  const config = {
    slack: {
      webhook: "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
      enabled: true
    },
    discord: {
      webhook: "https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK",
      enabled: true
    },
    notifications: {
      success: true,
      error: true,
      start: false,
      weekly_summary: true
    }
  };

  writeFileSync('scripts/notification-config.json', JSON.stringify(config, null, 2));
  console.log('📝 通知設定ファイルを生成: scripts/notification-config.json');
}

// コマンドライン実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'init') {
    createNotificationConfig();
  } else if (command === 'test') {
    const notifier = new NotificationManager();
    notifier.sendSuccessNotification({
      newCount: 3,
      totalCount: 201,
      avgCount: 20
    });
  } else {
    console.log('使用方法:');
    console.log('  node notification-manager.js init  # 設定ファイル生成');
    console.log('  node notification-manager.js test  # テスト通知送信');
  }
}

export default NotificationManager;
