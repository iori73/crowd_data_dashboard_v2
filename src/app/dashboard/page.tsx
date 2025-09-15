"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { CalendarFilter } from '@/components/calendar-filter'
import { WeeklyChart } from '@/components/charts/weekly-chart'
import { StatisticsCard } from '@/components/dashboard/statistics-card'
import { DataLoader, CrowdData } from '@/lib/dataLoader'
import { DataProcessor, WeeklyStats, OverallStats, FilterState } from '@/lib/dataProcessor'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, BarChart3, Users, Frown, Smile, LineChart, BarChart2, Menu } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ModeToggle } from '@/components/mode-toggle'
import { MobileMenu } from '@/components/mobile-menu'
import { FloatingRefreshButton } from '@/components/floating-refresh-button'
import { Language, useTranslation } from '@/lib/translations'

export default function DashboardPage() {
  const [data, setData] = useState<CrowdData[]>([])
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([])
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState<FilterState>({
    period: 'all',
    startDate: null,
    endDate: null,
  })
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ja')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t } = useTranslation(currentLanguage)

  const dataLoader = DataLoader.getInstance()
  const dataProcessor = DataProcessor.getInstance()

  const loadData = useCallback(async (forceReload = false) => {
    setLoading(true)
    setError(null)

    try {
      const loadedData = await dataLoader.loadCSVData(forceReload)
      if (loadedData.length === 0) {
        throw new Error(t('noDataFound'))
      }
      setData(loadedData)
    } catch (err) {
      console.error('Error loading data:', err)
      const errorMessage = err instanceof Error ? err.message : t('errorOccurred')
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [dataLoader])

  const handleFilterChange = (startDate: Date | null, endDate: Date | null) => {
    if (startDate && endDate) {
      setCurrentFilter({
        period: 'custom',
        startDate,
        endDate,
      })
    } else {
      setCurrentFilter({
        period: 'all',
        startDate: null,
        endDate: null,
      })
    }
  }

  const handleQuickFilter = (period: 'all' | 'week' | 'month' | 'lastMonth') => {
    setCurrentFilter({
      period,
      startDate: null,
      endDate: null,
    })
  }

  const handleExportCSV = () => {
    const csvContent = [
      ['Date', 'Time', 'Weekday', 'Count', 'Status'],
      ...data.map(row => [row.date, row.time, row.weekday, row.count, row.status_label])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crowd_data_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (data.length > 0) {
      const processedWeeklyStats = dataProcessor.processWeeklyData(data, currentFilter)
      const processedOverallStats = dataProcessor.calculateOverallStats(data, currentFilter)
      setWeeklyStats(processedWeeklyStats)
      setOverallStats(processedOverallStats)
    }
  }, [currentFilter, data, dataProcessor])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.833-2.733-.833-3.464 0L3.34 16c-.77.833.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="title-medium mb-2">{t('errorOccurred')}</h2>
          <p className="body text-gray-600 mb-4">{error}</p>
          <Button onClick={() => loadData(true)}>
            {t('retry')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="title-large text-gray-900 dark:text-white">
                <div>{t('dashboardTitle1')}</div>
                <div>{t('dashboardTitle2')}</div>
              </h1>
              <p className="body text-gray-600 dark:text-gray-300 mt-1">{t('dashboardSubtitle')}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Desktop buttons */}
              <div className="hidden md:flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => loadData(true)}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  {t('refresh')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={data.length === 0}
                >
                  <Download className="w-4 h-4 mr-1" />
                  {t('exportCSV')}
                </Button>
                <LanguageSwitcher 
                  currentLanguage={currentLanguage}
                  onLanguageChange={setCurrentLanguage}
                />
                <ModeToggle />
              </div>
              
              {/* Mobile hamburger button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar - Hidden on mobile */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hidden md:block">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Button
                variant={currentFilter.period === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickFilter('all')}
              >
                {t('allPeriod')}
              </Button>
              <Button
                variant={currentFilter.period === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickFilter('week')}
              >
                {t('thisWeek')}
              </Button>
              <Button
                variant={currentFilter.period === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickFilter('month')}
              >
                {t('thisMonth')}
              </Button>
              <Button
                variant={currentFilter.period === 'lastMonth' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickFilter('lastMonth')}
              >
                {t('lastMonth')}
              </Button>
            </div>
            <CalendarFilter onFilterChange={handleFilterChange} language={currentLanguage} />
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                <LineChart className="w-4 h-4 mr-1" />
                {t('lineChart')}
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                <BarChart2 className="w-4 h-4 mr-1" />
                {t('barChart')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onExportCSV={handleExportCSV}
        dataLength={data.length}
        currentFilter={currentFilter}
        onQuickFilter={handleQuickFilter}
        chartType={chartType}
        onChartTypeChange={setChartType}
      />

      {/* Floating Refresh Button - Mobile Only */}
      <FloatingRefreshButton
        onRefresh={() => loadData(true)}
        loading={loading}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-lime-600" />
              <p className="subheading text-gray-600">{t('loadingData')}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            {overallStats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatisticsCard
                  title={t('totalRecords')}
                  value={overallStats.totalRecords.toLocaleString()}
                  subtitle={`${overallStats.dateRange.start} - ${overallStats.dateRange.end}`}
                  icon={<BarChart3 className="w-5 h-5 text-lime-700" />}
                />
                <StatisticsCard
                  title={t('averageCrowd')}
                  value={`${overallStats.avgCount} ${t('people')}`}
                  subtitle={t('allPeriodAverage')}
                  icon={<Users className="w-5 h-5 text-lime-700" />}
                />
                <StatisticsCard
                  title={t('peakTime')}
                  value={(() => {
                    const weekdayTranslations: { [key: string]: { ja: string; en: string } } = {
                      'Monday': { ja: '月曜日', en: 'Monday' },
                      'Tuesday': { ja: '火曜日', en: 'Tuesday' },
                      'Wednesday': { ja: '水曜日', en: 'Wednesday' },
                      'Thursday': { ja: '木曜日', en: 'Thursday' },
                      'Friday': { ja: '金曜日', en: 'Friday' },
                      'Saturday': { ja: '土曜日', en: 'Saturday' },
                      'Sunday': { ja: '日曜日', en: 'Sunday' }
                    };
                    const translatedWeekday = weekdayTranslations[overallStats.peakWeekday]?.[currentLanguage] || overallStats.peakWeekday;
                    return `${translatedWeekday} ${overallStats.peakHour}:00`;
                  })()}
                  subtitle={`${t('maximum')}: ${overallStats.peakCount} ${t('people')}`}
                  icon={<Frown className="w-5 h-5 text-lime-700" />}
                />
                <StatisticsCard
                  title={t('quietTime')}
                  value={(() => {
                    const weekdayTranslations: { [key: string]: { ja: string; en: string } } = {
                      'Monday': { ja: '月曜日', en: 'Monday' },
                      'Tuesday': { ja: '火曜日', en: 'Tuesday' },
                      'Wednesday': { ja: '水曜日', en: 'Wednesday' },
                      'Thursday': { ja: '木曜日', en: 'Thursday' },
                      'Friday': { ja: '金曜日', en: 'Friday' },
                      'Saturday': { ja: '土曜日', en: 'Saturday' },
                      'Sunday': { ja: '日曜日', en: 'Sunday' }
                    };
                    const translatedWeekday = weekdayTranslations[overallStats.quietWeekday]?.[currentLanguage] || overallStats.quietWeekday;
                    return `${translatedWeekday} ${overallStats.quietHour}:00`;
                  })()}
                  subtitle={`${t('minimum')}: ${overallStats.quietCount} ${t('people')}`}
                  icon={<Smile className="w-5 h-5 text-lime-700" />}
                />
              </div>
            )}

            {/* Weekly Charts */}
            <div className="space-y-6">
              <h2 className="title-medium text-gray-900 dark:text-white">{t('weeklyAnalysis')}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {weeklyStats.map((stats) => (
                  <WeeklyChart 
                    key={stats.weekday} 
                    data={stats} 
                    type={chartType}
                    language={currentLanguage}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}