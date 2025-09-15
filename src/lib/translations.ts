export type Language = 'ja' | 'en'

export const translations = {
  ja: {
    // Header
    dashboardTitle1: 'My Gym',
    dashboardTitle2: '混雑状況ダッシュボード',
    dashboardSubtitle: 'リアルタイム混雑状況の分析と可視化',
    refresh: '更新',
    exportCSV: 'CSV',
    
    // Filter
    allPeriod: '全期間',
    thisWeek: '今週',
    thisMonth: '今月',
    lastMonth: '先月',
    customPeriod: 'カスタム期間',
    selectPeriod: '期間を選択',
    apply: '適用',
    cancel: 'キャンセル',
    clear: 'クリア',
    
    // Statistics
    totalRecords: '総レコード数',
    averageCrowd: '平均混雑度',
    peakTime: 'ピーク時間',
    quietTime: '閑散時間',
    people: '人',
    maximum: '最大',
    minimum: '最小',
    allPeriodAverage: '全期間平均',
    
    // Charts
    weeklyAnalysis: '曜日別混雑状況',
    crowdLevel: '混雑度',
    time: '時間',
    lineChart: '折れ線',
    barChart: '棒グラフ',
    
    // Days
    monday: '月曜日',
    tuesday: '火曜日',
    wednesday: '水曜日',
    thursday: '木曜日',
    friday: '金曜日',
    saturday: '土曜日',
    sunday: '日曜日',
    
    // Messages
    loadingData: 'データを読み込み中...',
    errorOccurred: 'エラーが発生しました',
    retry: '再試行',
    noDataFound: 'データが見つかりませんでした',
  },
  en: {
    // Header
    dashboardTitle1: 'My Gym',
    dashboardTitle2: 'Crowd Status Dashboard',
    dashboardSubtitle: 'Real-time crowd analysis and visualization',
    refresh: 'Refresh',
    exportCSV: 'CSV',
    
    // Filter
    allPeriod: 'All Period',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    customPeriod: 'Custom Period',
    selectPeriod: 'Select Period',
    apply: 'Apply',
    cancel: 'Cancel',
    clear: 'Clear',
    
    // Statistics
    totalRecords: 'Total Records',
    averageCrowd: 'Average Crowd',
    peakTime: 'Peak Time',
    quietTime: 'Quiet Time',
    people: 'people',
    maximum: 'Max',
    minimum: 'Min',
    allPeriodAverage: 'All Period Average',
    
    // Charts
    weeklyAnalysis: 'Weekly Crowd Analysis',
    crowdLevel: 'Crowd Level',
    time: 'Time',
    lineChart: 'Line',
    barChart: 'Bar',
    
    // Days
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    
    // Messages
    loadingData: 'Loading data...',
    errorOccurred: 'An error occurred',
    retry: 'Retry',
    noDataFound: 'No data found',
  }
}

export function useTranslation(language: Language) {
  return {
    t: (key: keyof typeof translations.ja): string => {
      return translations[language][key] || key
    }
  }
}