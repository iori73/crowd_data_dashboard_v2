#!/usr/bin/env node

/**
 * 抽出されたデータをCSVファイルに統合
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

class CSVDataUpdater {
  constructor() {
    this.csvFile = 'public/fit_place24_data.csv';
    this.extractedDataFile = 'scripts/extracted-data.json';
    this.csvHeaders = [
      'datetime', 'date', 'time', 'hour', 'weekday', 
      'count', 'status_label', 'status_code', 'status_min', 'status_max', 'raw_text'
    ];
  }

  /**
   * CSVデータ更新のメイン処理
   */
  async updateCSV() {
    console.log('📊 CSVデータ更新を開始...');

    try {
      // 抽出データを読み込み
      const extractedData = this.loadExtractedData();
      if (!extractedData || extractedData.length === 0) {
        console.log('📭 更新対象のデータがありません');
        return;
      }

      console.log(`📄 ${extractedData.length}件の新しいデータを処理中...`);

      // 既存CSVデータを読み込み
      const existingData = this.loadExistingCSV();
      console.log(`💾 既存データ: ${existingData.length}件`);

      // 新データを変換
      const newRecords = this.convertToCSVFormat(extractedData);
      console.log(`🔄 変換済み新データ: ${newRecords.length}件`);

      // データを統合して重複除去
      const allData = [...existingData, ...newRecords];
      const uniqueData = this.removeDuplicates(allData);
      const addedCount = uniqueData.length - existingData.length;

      console.log(`🔗 重複除去完了: ${uniqueData.length}件（新規追加: ${addedCount}件）`);

      // CSVファイルを更新
      this.writeCSVFile(uniqueData);
      
      console.log(`✅ CSVファイル更新完了!`);
      console.log(`   📁 ファイル: ${this.csvFile}`);
      console.log(`   📊 総データ数: ${uniqueData.length}件`);
      console.log(`   ➕ 新規追加: ${addedCount}件`);

    } catch (error) {
      console.error('❌ CSV更新エラー:', error.message);
      throw error;
    }
  }

  /**
   * 抽出されたデータを読み込み
   */
  loadExtractedData() {
    if (!existsSync(this.extractedDataFile)) {
      console.log('📭 抽出データファイルが見つかりません');
      return [];
    }

    try {
      const content = readFileSync(this.extractedDataFile, 'utf8');
      const jsonData = JSON.parse(content);
      return jsonData.data || [];
    } catch (error) {
      console.error('抽出データ読み込みエラー:', error.message);
      return [];
    }
  }

  /**
   * 既存CSVデータを読み込み
   */
  loadExistingCSV() {
    if (!existsSync(this.csvFile)) {
      console.log('📄 既存CSVファイルが見つかりません（新規作成）');
      return [];
    }

    try {
      const content = readFileSync(this.csvFile, 'utf8');
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      return records;
    } catch (error) {
      console.error('CSV読み込みエラー:', error.message);
      return [];
    }
  }

  /**
   * 抽出データをCSV形式に変換
   */
  convertToCSVFormat(extractedData) {
    return extractedData.map(item => {
      const date = new Date(item.date + 'T' + item.time + ':00');
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

      return {
        datetime: `${item.date} ${item.time}:00`,
        date: item.date,
        time: item.time,
        hour: item.hour,
        weekday: weekday,
        count: item.count,
        status_label: item.status,
        status_code: item.statusCode,
        status_min: item.statusMin,
        status_max: item.statusMax,
        raw_text: item.rawText
      };
    });
  }

  /**
   * 重複データを除去
   */
  removeDuplicates(data) {
    const seen = new Set();
    const unique = [];

    for (const record of data) {
      // datetime + count で重複チェック
      const key = `${record.datetime}_${record.count}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(record);
      }
    }

    // 日時順にソート
    unique.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    return unique;
  }

  /**
   * CSVファイルに書き込み
   */
  writeCSVFile(data) {
    const csvContent = stringify(data, {
      header: true,
      columns: this.csvHeaders
    });

    writeFileSync(this.csvFile, csvContent, 'utf8');
  }

  /**
   * 統計情報を生成
   */
  generateStats(data) {
    if (data.length === 0) return null;

    const counts = data.map(r => parseInt(r.count)).filter(c => !isNaN(c));
    const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;

    // 最新のデータ
    const latest = data[data.length - 1];
    
    // 最も混雑している時間帯
    const busiest = data.reduce((max, current) => 
      parseInt(current.count) > parseInt(max.count) ? current : max
    );

    // 最も空いている時間帯
    const quietest = data.reduce((min, current) => 
      parseInt(current.count) < parseInt(min.count) ? current : min
    );

    return {
      totalRecords: data.length,
      avgCount: Math.round(avgCount),
      latest,
      busiest,
      quietest
    };
  }
}

// メイン実行
async function main() {
  try {
    const updater = new CSVDataUpdater();
    await updater.updateCSV();
  } catch (error) {
    console.error('❌ 処理失敗:', error.message);
    process.exit(1);
  }
}

main();
