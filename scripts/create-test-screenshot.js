#!/usr/bin/env node

/**
 * テスト用のMy Gym風スクリーンショット画像を生成
 */

import { writeFileSync } from 'fs';

// SVGでMy Gym風のテスト画像を生成
function createTestScreenshot(count, status, time, date) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="400" height="300" fill="#f8f9fa"/>
  
  <!-- ヘッダー -->
  <rect width="400" height="60" fill="#007bff"/>
  <text x="200" y="35" text-anchor="middle" fill="white" font-family="Arial" font-size="18" font-weight="bold">My Gym</text>
  
  <!-- 混雑状況エリア -->
  <rect x="20" y="80" width="360" height="180" fill="white" stroke="#dee2e6" stroke-width="1" rx="8"/>
  
  <!-- 混雑状況ラベル -->
  <text x="200" y="110" text-anchor="middle" fill="#495057" font-family="Arial" font-size="16" font-weight="bold">現在の混雑状況</text>
  
  <!-- 人数表示 -->
  <text x="200" y="150" text-anchor="middle" fill="#007bff" font-family="Arial" font-size="36" font-weight="bold">${count}人</text>
  
  <!-- ステータス表示 -->
  <text x="200" y="180" text-anchor="middle" fill="#495057" font-family="Arial" font-size="18">${status}</text>
  
  <!-- 時刻表示 -->
  <text x="200" y="210" text-anchor="middle" fill="#6c757d" font-family="Arial" font-size="14">${time}時点</text>
  
  <!-- 日付表示 -->
  <text x="200" y="235" text-anchor="middle" fill="#6c757d" font-family="Arial" font-size="12">${date}</text>
</svg>`;

  return svg;
}

// テスト用のデータパターン
const testPatterns = [
  {
    count: 22,
    status: 'やや混んでいます',
    time: '10:40',
    date: '2025-09-15',
    filename: 'FP24_20250915_1040.svg'
  },
  {
    count: 15,
    status: '空いています', 
    time: '14:20',
    date: '2025-09-15',
    filename: 'FP24_20250915_1420.svg'
  },
  {
    count: 35,
    status: '混んでいます',
    time: '19:30', 
    date: '2025-09-15',
    filename: 'FP24_20250915_1930.svg'
  }
];

console.log('🎨 テスト用スクリーンショットを生成中...');

testPatterns.forEach((pattern, index) => {
  const svg = createTestScreenshot(pattern.count, pattern.status, pattern.time, pattern.date);
  const filepath = `screenshots/inbox/${pattern.filename}`;
  
  writeFileSync(filepath, svg, 'utf8');
  console.log(`   ✅ ${pattern.filename} - ${pattern.count}人 ${pattern.status}`);
});

console.log('🎉 テスト用画像生成完了!');
console.log('📁 場所: screenshots/inbox/');
