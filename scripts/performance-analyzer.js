#!/usr/bin/env node

/**
 * ジムデータのパフォーマンス分析・予測機能
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { parse } from 'csv-parse/sync';

class PerformanceAnalyzer {
  constructor() {
    this.csvFile = 'public/fit_place24_data.csv';
    this.outputFile = 'public/performance-analysis.json';
  }

  /**
   * パフォーマンス分析のメイン処理
   */
  async analyzePerformance() {
    console.log('🔍 パフォーマンス分析を開始...');

    try {
      const data = this.loadCSVData();
      if (data.length === 0) {
        console.log('📭 分析対象のデータがありません');
        return;
      }

      console.log(`📊 ${data.length}件のデータを分析中...`);

      const analysis = {
        generatedAt: new Date().toISOString(),
        totalRecords: data.length,
        dateRange: this.getDateRange(data),
        ...this.analyzeCrowdingPatterns(data),
        ...this.analyzeTimeEfficiency(data),
        ...this.generateRecommendations(data),
      };

      this.saveAnalysis(analysis);
      this.printAnalysisSummary(analysis);

      console.log('✅ パフォーマンス分析完了!');
    } catch (error) {
      console.error('❌ 分析エラー:', error.message);
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
        trim: true,
      });
    } catch (error) {
      console.error('CSV読み込みエラー:', error.message);
      return [];
    }
  }

  /**
   * 日付範囲を取得
   */
  getDateRange(data) {
    const dates = data
      .map((r) => r.date)
      .filter((d) => d)
      .sort();
    return {
      start: dates[0],
      end: dates[dates.length - 1],
      totalDays: dates.length > 0 ? new Set(dates).size : 0,
    };
  }

  /**
   * 混雑パターン分析
   */
  analyzeCrowdingPatterns(data) {
    const hourlyStats = {};
    const weekdayStats = {};
    const monthlyStats = {};

    // 時間別分析
    for (let hour = 0; hour < 24; hour++) {
      hourlyStats[hour] = [];
    }

    data.forEach((record) => {
      const hour = parseInt(record.hour);
      const count = parseInt(record.count);
      const weekday = record.weekday;
      const date = new Date(record.date);
      const month = date.getMonth();

      if (!isNaN(hour) && !isNaN(count)) {
        hourlyStats[hour].push(count);
      }

      if (!weekdayStats[weekday]) {
        weekdayStats[weekday] = [];
      }
      weekdayStats[weekday].push(count);

      if (!monthlyStats[month]) {
        monthlyStats[month] = [];
      }
      monthlyStats[month].push(count);
    });

    return {
      crowdingPatterns: {
        peakHours: this.findPeakHours(hourlyStats),
        quietHours: this.findQuietHours(hourlyStats),
        weekdayTrends: this.analyzeWeekdayTrends(weekdayStats),
        monthlyTrends: this.analyzeMonthlyTrends(monthlyStats),
        crowdingDistribution: this.analyzeCrowdingDistribution(data),
      },
    };
  }

  /**
   * ピーク時間を特定
   */
  findPeakHours(hourlyStats) {
    const peaks = [];

    for (const hour in hourlyStats) {
      const counts = hourlyStats[hour];
      if (counts.length > 0) {
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
        const max = Math.max(...counts);
        peaks.push({
          hour: parseInt(hour),
          averageCount: Math.round(avg),
          maxCount: max,
          frequency: counts.length,
        });
      }
    }

    return peaks
      .filter((p) => p.averageCount >= 25) // 平均25人以上を混雑とみなす
      .sort((a, b) => b.averageCount - a.averageCount)
      .slice(0, 5);
  }

  /**
   * 静かな時間を特定
   */
  findQuietHours(hourlyStats) {
    const quiet = [];

    for (const hour in hourlyStats) {
      const counts = hourlyStats[hour];
      if (counts.length > 0) {
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
        const min = Math.min(...counts);
        quiet.push({
          hour: parseInt(hour),
          averageCount: Math.round(avg),
          minCount: min,
          frequency: counts.length,
        });
      }
    }

    return quiet
      .filter((q) => q.averageCount <= 15) // 平均15人以下を空いているとみなす
      .sort((a, b) => a.averageCount - b.averageCount)
      .slice(0, 5);
  }

  /**
   * 曜日傾向を分析
   */
  analyzeWeekdayTrends(weekdayStats) {
    const trends = [];

    const weekdayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    weekdayOrder.forEach((weekday) => {
      if (weekdayStats[weekday] && weekdayStats[weekday].length > 0) {
        const counts = weekdayStats[weekday];
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
        trends.push({
          weekday,
          averageCount: Math.round(avg),
          visits: counts.length,
          trend: avg > 20 ? 'busy' : avg > 15 ? 'moderate' : 'quiet',
        });
      }
    });

    return trends;
  }

  /**
   * 月別傾向を分析
   */
  analyzeMonthlyTrends(monthlyStats) {
    const trends = [];
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    for (let month = 0; month < 12; month++) {
      if (monthlyStats[month] && monthlyStats[month].length > 0) {
        const counts = monthlyStats[month];
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
        trends.push({
          month: monthNames[month],
          averageCount: Math.round(avg),
          visits: counts.length,
        });
      }
    }

    return trends.sort((a, b) => b.averageCount - a.averageCount);
  }

  /**
   * 混雑分布を分析
   */
  analyzeCrowdingDistribution(data) {
    const distribution = {
      veryQuiet: 0, // 0-10人
      quiet: 0, // 11-20人
      moderate: 0, // 21-30人
      busy: 0, // 31-40人
      veryBusy: 0, // 41人以上
    };

    data.forEach((record) => {
      const count = parseInt(record.count);
      if (!isNaN(count)) {
        if (count <= 10) distribution.veryQuiet++;
        else if (count <= 20) distribution.quiet++;
        else if (count <= 30) distribution.moderate++;
        else if (count <= 40) distribution.busy++;
        else distribution.veryBusy++;
      }
    });

    const total = data.length;
    return {
      counts: distribution,
      percentages: {
        veryQuiet: Math.round((distribution.veryQuiet / total) * 100),
        quiet: Math.round((distribution.quiet / total) * 100),
        moderate: Math.round((distribution.moderate / total) * 100),
        busy: Math.round((distribution.busy / total) * 100),
        veryBusy: Math.round((distribution.veryBusy / total) * 100),
      },
    };
  }

  /**
   * 時間効率性の分析
   */
  analyzeTimeEfficiency(data) {
    const efficiency = {
      bestWorkoutTimes: this.findBestWorkoutTimes(data),
      worstWorkoutTimes: this.findWorstWorkoutTimes(data),
      weeklyEfficiency: this.analyzeWeeklyEfficiency(data),
    };

    return { timeEfficiency: efficiency };
  }

  /**
   * 最適なワークアウト時間を特定
   */
  findBestWorkoutTimes(data) {
    const hourlyData = {};

    data.forEach((record) => {
      const hour = parseInt(record.hour);
      const count = parseInt(record.count);

      if (!hourlyData[hour]) {
        hourlyData[hour] = [];
      }
      hourlyData[hour].push(count);
    });

    const bestTimes = [];

    for (const hour in hourlyData) {
      const counts = hourlyData[hour];
      const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
      const consistency = this.calculateConsistency(counts);

      if (avg <= 15 && consistency > 0.7) {
        // 平均15人以下で一貫性70%以上
        bestTimes.push({
          hour: parseInt(hour),
          averageCount: Math.round(avg),
          consistency: Math.round(consistency * 100),
          visits: counts.length,
          efficiencyScore: Math.round((1 - avg / 50) * consistency * 100),
        });
      }
    }

    return bestTimes.sort((a, b) => b.efficiencyScore - a.efficiencyScore).slice(0, 3);
  }

  /**
   * 避けるべき時間を特定
   */
  findWorstWorkoutTimes(data) {
    const hourlyData = {};

    data.forEach((record) => {
      const hour = parseInt(record.hour);
      const count = parseInt(record.count);

      if (!hourlyData[hour]) {
        hourlyData[hour] = [];
      }
      hourlyData[hour].push(count);
    });

    const worstTimes = [];

    for (const hour in hourlyData) {
      const counts = hourlyData[hour];
      const avg = counts.reduce((a, b) => a + b, 0) / counts.length;

      if (avg >= 30) {
        // 平均30人以上を混雑とみなす
        worstTimes.push({
          hour: parseInt(hour),
          averageCount: Math.round(avg),
          maxCount: Math.max(...counts),
          visits: counts.length,
        });
      }
    }

    return worstTimes.sort((a, b) => b.averageCount - a.averageCount).slice(0, 3);
  }

  /**
   * 一貫性を計算
   */
  calculateConsistency(values) {
    if (values.length === 0) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // 一貫性 = 1 - (標準偏差 / 平均)、最大1に制限
    return Math.min(1, Math.max(0, 1 - stdDev / mean));
  }

  /**
   * 週別効率性分析
   */
  analyzeWeeklyEfficiency(data) {
    const weeklyStats = {};

    data.forEach((record) => {
      const date = new Date(record.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // 週の始まり（日曜日）
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyStats[weekKey]) {
        weeklyStats[weekKey] = [];
      }
      weeklyStats[weekKey].push(parseInt(record.count));
    });

    const efficiency = [];

    for (const week in weeklyStats) {
      const counts = weeklyStats[week];
      const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
      const quietSessions = counts.filter((c) => c <= 15).length;
      const efficiencyRate = quietSessions / counts.length;

      efficiency.push({
        week,
        averageCount: Math.round(avg),
        totalSessions: counts.length,
        quietSessions,
        efficiencyRate: Math.round(efficiencyRate * 100),
      });
    }

    return efficiency.sort((a, b) => new Date(b.week).getTime() - new Date(a.week).getTime()).slice(0, 4); // 最近4週間
  }

  /**
   * 推奨事項を生成
   */
  generateRecommendations(data) {
    const recommendations = [];
    const hourlyAvg = {};

    data.forEach((record) => {
      const hour = parseInt(record.hour);
      const count = parseInt(record.count);

      if (!hourlyAvg[hour]) {
        hourlyAvg[hour] = [];
      }
      hourlyAvg[hour].push(count);
    });

    // 最適な時間帯の推奨
    for (const hour in hourlyAvg) {
      const counts = hourlyAvg[hour];
      const avg = counts.reduce((a, b) => a + b, 0) / counts.length;

      if (avg <= 10) {
        recommendations.push({
          type: 'optimal_time',
          hour: parseInt(hour),
          message: `${hour}:00は平均${Math.round(avg)}人で最適なワークアウト時間です`,
          priority: 'high',
          averageCount: Math.round(avg),
        });
      } else if (avg >= 35) {
        recommendations.push({
          type: 'avoid_time',
          hour: parseInt(hour),
          message: `${hour}:00は平均${Math.round(avg)}人で混雑するため避けることをお勧めします`,
          priority: 'high',
          averageCount: Math.round(avg),
        });
      }
    }

    return {
      recommendations: recommendations
        .sort((a, b) => {
          if (a.priority === 'high' && b.priority !== 'high') return -1;
          if (a.priority !== 'high' && b.priority === 'high') return 1;
          return a.hour - b.hour;
        })
        .slice(0, 10),
    };
  }

  /**
   * 分析結果を保存
   */
  saveAnalysis(analysis) {
    writeFileSync(this.outputFile, JSON.stringify(analysis, null, 2), 'utf8');
    console.log(`💾 分析結果を保存: ${this.outputFile}`);
  }

  /**
   * 分析サマリーをコンソールに出力
   */
  printAnalysisSummary(analysis) {
    console.log('\n🔍 === パフォーマンス分析サマリー ===');
    console.log(`📊 分析期間: ${analysis.dateRange.start} ～ ${analysis.dateRange.end}`);
    console.log(`📈 総データ数: ${analysis.totalRecords}件`);

    if (analysis.crowdingPatterns.quietHours.length > 0) {
      const best = analysis.crowdingPatterns.quietHours[0];
      console.log(`🎯 最適時間: ${best.hour}:00（平均${best.averageCount}人）`);
    }

    if (analysis.crowdingPatterns.peakHours.length > 0) {
      const peak = analysis.crowdingPatterns.peakHours[0];
      console.log(`⚠️ 混雑ピーク: ${peak.hour}:00（平均${peak.averageCount}人）`);
    }

    console.log(`💡 推奨事項: ${analysis.recommendations.length}件`);
    console.log('='.repeat(40));
  }
}

// メイン実行
async function main() {
  try {
    const analyzer = new PerformanceAnalyzer();
    await analyzer.analyzePerformance();
  } catch (error) {
    console.error('❌ 処理失敗:', error.message);
    process.exit(1);
  }
}

main();
