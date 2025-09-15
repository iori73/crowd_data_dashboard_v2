"use client"

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { Line, Bar } from 'react-chartjs-2'
import { WeeklyStats } from '@/lib/dataProcessor'
import { Language, useTranslation } from '@/lib/translations'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
)

interface WeeklyChartProps {
  data: WeeklyStats
  type?: 'line' | 'bar'
  language?: Language
}

export function WeeklyChart({ data, type = 'line', language = 'ja' }: WeeklyChartProps) {
  const { t } = useTranslation(language)
  
  // Calculate average for the day
  const dataValues = data.data.map(d => d.avgCount)
  const nonZeroValues = dataValues.filter(v => v > 0)
  const averageValue = nonZeroValues.length > 0 
    ? Math.round(nonZeroValues.reduce((a, b) => a + b, 0) / nonZeroValues.length)
    : 0
  
  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: data.weekday,
        data: dataValues,
        borderColor: '#84cc16',
        backgroundColor: type === 'bar' ? 'rgba(132, 204, 22, 0.5)' : 'rgba(132, 204, 22, 0.1)',
        tension: 0.3,
      },
    ],
  }

  // Translate weekday names
  const weekdayTranslations: { [key: string]: { ja: string; en: string } } = {
    '月曜日': { ja: '月曜日', en: 'Monday' },
    '火曜日': { ja: '火曜日', en: 'Tuesday' },
    '水曜日': { ja: '水曜日', en: 'Wednesday' },
    '木曜日': { ja: '木曜日', en: 'Thursday' },
    '金曜日': { ja: '金曜日', en: 'Friday' },
    '土曜日': { ja: '土曜日', en: 'Saturday' },
    '日曜日': { ja: '日曜日', en: 'Sunday' }
  }
  
  const translatedWeekday = weekdayTranslations[data.weekday]?.[language] || data.weekday
  
  const titleText = language === 'ja' 
    ? `${translatedWeekday}の混雑状況`
    : `${translatedWeekday} Crowd Status`
  
  const averageLabel = language === 'ja' 
    ? `平均人数 ${averageValue}`
    : `Average ${averageValue}`

  const options: ChartOptions<typeof type> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: titleText,
        font: {
          size: 20,
          weight: 'bold',
        },
      },
      tooltip: {
        titleFont: {
          size: 16,
          weight: 'bold',
        },
        bodyFont: {
          size: 14,
        },
        callbacks: {
          label: (context) => {
            return `${t('crowdLevel')}: ${context.parsed.y} ${t('people')}`
          },
        },
      },
      annotation: {
        annotations: {
          averageLine: {
            type: 'line' as const,
            yMin: averageValue,
            yMax: averageValue,
            borderColor: 'rgba(107, 114, 128, 0.7)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              display: true,
              content: averageLabel,
              position: 'end' as const,
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
              color: 'rgb(107, 114, 128)',
              font: {
                size: 16,
                weight: 'bold' as const,
              },
              padding: {
                top: 4,
                bottom: 4,
                left: 8,
                right: 8,
              },
              borderRadius: 4,
            },
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: t('crowdLevel'),
          font: {
            size: 16,
          },
        },
        ticks: {
          font: {
            size: 14,
          },
        },
      },
      x: {
        title: {
          display: true,
          text: t('time'),
          font: {
            size: 16,
          },
        },
        ticks: {
          font: {
            size: 14,
          },
        },
      },
    },
  }

  const ChartComponent = type === 'bar' ? Bar : Line

  return (
    <div className="w-full h-[300px] p-4 bg-white rounded-lg shadow-sm border">
      <ChartComponent data={chartData} options={options} />
    </div>
  )
}