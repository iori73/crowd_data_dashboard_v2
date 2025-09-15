#!/usr/bin/env node

/**
 * 週次レポート生成
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { parse } from 'csv-parse/sync';

class WeeklyReportGenerator {
  constructor() {
    this.csvFile = 'public/fit_place24_data.csv';
    this.reportFile = 'scripts/weekly-report.md';
  }

  /**
   * 週次レポート生成
   */
  async generateReport() {
    console.log('📈 週次レポートを生成中...');

    try {
      const data = this.loadCSVData();
      if (data.length === 0) {
        console.log('📭 レポート対象のデータがありません');
        return;
      }

      const stats = this.calculateStats(data);
      const report = this.generateReportContent(stats, data);
      
      writeFileSync(this.reportFile, report, 'utf8');
      
      console.log('✅ 週次レポート生成完了!');
      console.log(`📄 ファイル: ${this.reportFile}`);
      
      // コンソールにも要約を出力
      this.printSummary(stats);
      
    } catch (error) {
      console.error('❌ レポート生成エラー:', error.message);
      throw error;
    }
  }

  /**
   * CSVデータを読み込み
   */
  loadCSVData() {
    if (!existsSync(this.csvFile)) {
      return [];
    }

    try {
      const content = readFileSync(this.csvFile, 'utf8');
      return parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch (error) {
      console.error('CSV読み込みエラー:', error.message);
      return [];
    }
  }

  /**
   * 統計情報を計算
   */
  calculateStats(data) {
    const counts = data.map(r => parseInt(r.count)).filter(c => !isNaN(c));
    const totalRecords = data.length;
    const avgCount = counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;

    // 時間帯別統計
    const hourlyStats = {};
    for (let hour = 0; hour < 24; hour++) {
      hourlyStats[hour] = [];
    }

    data.forEach(record => {
      const hour = parseInt(record.hour);
      const count = parseInt(record.count);
      if (!isNaN(hour) && !isNaN(count)) {
        hourlyStats[hour].push(count);
      }
    });

    // 最適時間帯（平均15人以下）
    const bestHours = [];
    for (const hour in hourlyStats) {
      const counts = hourlyStats[hour];
      if (counts.length > 0) {
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
        if (avg <= 15) {
          bestHours.push({ hour: parseInt(hour), avg: Math.round(avg), count: counts.length });
        }
      }
    }
    bestHours.sort((a, b) => a.avg - b.avg);

    // 混雑時間帯（平均25人以上）
    const busyHours = [];
    for (const hour in hourlyStats) {
      const counts = hourlyStats[hour];
      if (counts.length > 0) {
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
        if (avg >= 25) {
          busyHours.push({ hour: parseInt(hour), avg: Math.round(avg), count: counts.length });
        }
      }
    }
    busyHours.sort((a, b) => b.avg - a.avg);

    // 曜日別統計
    const weekdayStats = {};
    data.forEach(record => {
      const weekday = record.weekday;
      const count = parseInt(record.count);
      if (!weekdayStats[weekday]) {
        weekdayStats[weekday] = [];
      }
      weekdayStats[weekday].push(count);
    });

    const weekdayAvg = {};
    for (const weekday in weekdayStats) {
      const counts = weekdayStats[weekday];
      weekdayAvg[weekday] = counts.reduce((a, b) => a + b, 0) / counts.length;
    }

    // 最新データの範囲
    const dates = data.map(r => r.date).sort();
    const dateRange = {
      start: dates[0],
      end: dates[dates.length - 1]
    };

    return {
      totalRecords,
      avgCount: Math.round(avgCount),
      bestHours,
      busyHours,
      weekdayAvg,
      dateRange,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * レポート内容を生成
   */
  generateReportContent(stats, data) {
    const report = `# 🏋️ FIT PLACE24 週次分析レポート

**生成日時**: ${new Date(stats.lastUpdated).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}

**データ期間**: ${stats.dateRange.start} ～ ${stats.dateRange.end}

---

## 📊 データサマリー

- **総データ数**: ${stats.totalRecords}件
- **平均混雑度**: ${stats.avgCount}人
- **最新更新**: ${stats.lastUpdated.split('T')[0]}

---

## 🎯 最適利用時間帯（空いている時間）

${stats.bestHours.length > 0 ? 
  stats.bestHours.map(h => `- **${h.hour}:00** - 平均 ${h.avg}人 ⭐️`).join('\n') :
  '- データが不足しています'
}

---

## ⚠️ 混雑時間帯（避けるべき時間）

${stats.busyHours.length > 0 ?
  stats.busyHours.map(h => `- **${h.hour}:00** - 平均 ${h.avg}人 ⚠️`).join('\n') :
  '- 特に混雑している時間帯はありません'
}

---

## 📅 曜日別平均混雑度

${Object.entries(stats.weekdayAvg)
  .sort(([,a], [,b]) => a - b)
  .map(([day, avg]) => `- **${day}**: ${Math.round(avg)}人`)
  .join('\n')
}

---

## 💡 おすすめアクション

${this.generateRecommendations(stats)}

---

*このレポートは自動生成されました 🤖*
`;

    return report;
  }

  /**
   * おすすめアクションを生成
   */
  generateRecommendations(stats) {
    const recommendations = [];

    if (stats.bestHours.length > 0) {
      const bestHour = stats.bestHours[0];
      recommendations.push(`✅ **${bestHour.hour}:00頃**の利用がおすすめです（平均${bestHour.avg}人）`);
    }

    if (stats.busyHours.length > 0) {
      const busiestHour = stats.busyHours[0];
      recommendations.push(`⚠️ **${busiestHour.hour}:00頃**は混雑するため避けましょう（平均${busiestHour.avg}人）`);
    }

    // 曜日のおすすめ
    const sortedWeekdays = Object.entries(stats.weekdayAvg).sort(([,a], [,b]) => a - b);
    if (sortedWeekdays.length > 0) {
      const bestDay = sortedWeekdays[0];
      recommendations.push(`📅 **${bestDay[0]}曜日**が一番空いています（平均${Math.round(bestDay[1])}人）`);
    }

    return recommendations.length > 0 ? recommendations.join('\n\n') : '現在のデータから具体的な推奨はありません';
  }

  /**
   * コンソールに要約を出力
   */
  printSummary(stats) {
    console.log('\n📈 === 週次分析サマリー ===');
    console.log(`📊 総データ数: ${stats.totalRecords}件`);
    console.log(`👥 平均混雑度: ${stats.avgCount}人`);
    
    if (stats.bestHours.length > 0) {
      const best = stats.bestHours[0];
      console.log(`🎯 最適時間: ${best.hour}:00（平均${best.avg}人）`);
    }
    
    if (stats.busyHours.length > 0) {
      const busy = stats.busyHours[0];
      console.log(`⚠️ 混雑時間: ${busy.hour}:00（平均${busy.avg}人）`);
    }
    
    console.log('='.repeat(30));
  }
}

// メイン実行
async function main() {
  try {
    const generator = new WeeklyReportGenerator();
    await generator.generateReport();
  } catch (error) {
    console.error('❌ 処理失敗:', error.message);
    process.exit(1);
  }
}

main();
