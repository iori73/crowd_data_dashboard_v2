'use client';

import React, { useRef, useState, useEffect } from 'react';
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
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Line, Bar } from 'react-chartjs-2';
import { WeeklyStats } from '@/lib/dataProcessor';
import { Language, useTranslation } from '@/lib/translations';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
);

interface WeeklyChartProps {
  data: WeeklyStats;
  type?: 'line' | 'bar';
  language?: Language;
}

export function WeeklyChart({ data, type = 'line', language = 'ja' }: WeeklyChartProps) {
  const { t } = useTranslation(language);
  const chartRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check if dark mode is active
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Initial check
    checkDarkMode();

    // Watch for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Calculate average for the day
  const dataValues = data.data.map((d) => d.avgCount);
  const nonZeroValues = dataValues.filter((v) => v > 0);
  const averageValue =
    nonZeroValues.length > 0 ? Math.round(nonZeroValues.reduce((a, b) => a + b, 0) / nonZeroValues.length) : 0;

  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: data.weekday,
        data: dataValues,
        borderColor: '#bef264',
        backgroundColor: type === 'bar' ? 'rgba(190, 242, 100, 0.5)' : 'rgba(190, 242, 100, 0.1)',
        tension: 0.3,
      },
    ],
  };

  // Translate weekday names
  const weekdayTranslations: { [key: string]: { ja: string; en: string } } = {
    月曜日: { ja: '月曜日', en: 'Monday' },
    火曜日: { ja: '火曜日', en: 'Tuesday' },
    水曜日: { ja: '水曜日', en: 'Wednesday' },
    木曜日: { ja: '木曜日', en: 'Thursday' },
    金曜日: { ja: '金曜日', en: 'Friday' },
    土曜日: { ja: '土曜日', en: 'Saturday' },
    日曜日: { ja: '日曜日', en: 'Sunday' },
  };

  const translatedWeekday = weekdayTranslations[data.weekday]?.[language] || data.weekday;

  const titleText = language === 'ja' ? `${translatedWeekday}の混雑状況` : `${translatedWeekday} Crowd Status`;

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
        color: isDarkMode ? '#FFFFFF' : '#111827',
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
            return `${t('crowdLevel')}: ${context.parsed.y} ${t('people')}`;
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
              display: false,
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
          color: isDarkMode ? '#E5E7EB' : '#374151',
        },
        ticks: {
          font: {
            size: 14,
          },
          color: isDarkMode ? '#E5E7EB' : '#6B7280',
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#F3F4F6',
        },
      },
      x: {
        title: {
          display: true,
          text: t('time'),
          font: {
            size: 16,
          },
          color: isDarkMode ? '#E5E7EB' : '#374151',
        },
        ticks: {
          font: {
            size: 14,
          },
          color: isDarkMode ? '#E5E7EB' : '#6B7280',
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#F3F4F6',
        },
      },
    },
  };

  const ChartComponent = type === 'bar' ? Bar : Line;

  // Calculate Y position to match the dashed line
  const maxValue = Math.max(...dataValues, averageValue);
  const minValue = 0;
  const range = maxValue - minValue;

  // Chart.js layout calculations
  const containerHeight = 300;
  const topPadding = 50; // Title + padding
  const bottomPadding = 60; // X-axis labels + padding
  const chartAreaHeight = containerHeight - topPadding - bottomPadding;

  // Calculate position: higher values appear lower on screen (inverted Y)
  const valueRatio = range > 0 ? (maxValue - averageValue) / range : 0;
  const topPosition = topPadding + valueRatio * chartAreaHeight;

  const generateTrueSVG = (): string => {
    if (!chartRef.current) return '';

    const containerWidth = chartRef.current.offsetWidth;
    const containerHeight = 300;

    // Layout constants matching Chart.js configuration
    const padding = 16; // p-4 = 16px
    const rightPadding = 40; // pr-10 = 40px
    const topPadding = 50; // Title + padding
    const bottomPadding = 60; // X-axis labels + padding
    const leftPadding = 70; // Y-axis labels + padding

    const chartWidth = containerWidth - padding - rightPadding - leftPadding;
    const chartHeight = containerHeight - topPadding - bottomPadding;

    const chartStartX = padding + leftPadding;
    const chartStartY = topPadding;
    const chartEndX = chartStartX + chartWidth;
    const chartEndY = chartStartY + chartHeight;

    // Data range
    const maxValue = Math.max(...dataValues, averageValue);
    const minValue = 0;
    const range = maxValue - minValue || 1;

    // Helper functions
    const scaleY = (value: number) => {
      return chartEndY - ((value - minValue) / range) * chartHeight;
    };

    const scaleX = (index: number) => {
      return chartStartX + (index / (24 - 1)) * chartWidth;
    };

    // Build SVG content
    const svgElements: string[] = [];

    // Background rectangle with border
    svgElements.push(
      `<rect x="0" y="0" width="${containerWidth}" height="${containerHeight}" fill="#ffffff" stroke="#e5e7eb" stroke-width="1" rx="8"/>`,
    );

    // Title
    svgElements.push(
      `<text x="${
        containerWidth / 2
      }" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#111827">${titleText}</text>`,
    );

    // Y-axis title
    svgElements.push(
      `<text x="15" y="${
        chartStartY + chartHeight / 2
      }" font-family="system-ui, -apple-system, sans-serif" font-size="16" text-anchor="middle" fill="#374151" transform="rotate(-90, 15, ${
        chartStartY + chartHeight / 2
      })">${t('crowdLevel')}</text>`,
    );

    // X-axis title
    svgElements.push(
      `<text x="${chartStartX + chartWidth / 2}" y="${
        containerHeight - 10
      }" font-family="system-ui, -apple-system, sans-serif" font-size="16" text-anchor="middle" fill="#374151">${t(
        'time',
      )}</text>`,
    );

    // Y-axis grid lines and labels
    const yTickCount = Math.ceil(maxValue / 5);
    for (let i = 0; i <= yTickCount; i++) {
      const value = i * 5;
      const y = scaleY(value);

      // Grid line
      if (value <= maxValue) {
        svgElements.push(
          `<line x1="${chartStartX}" y1="${y}" x2="${chartEndX}" y2="${y}" stroke="#f3f4f6" stroke-width="1"/>`,
        );
        // Label
        svgElements.push(
          `<text x="${chartStartX - 10}" y="${
            y + 5
          }" font-family="system-ui, -apple-system, sans-serif" font-size="14" text-anchor="end" fill="#6b7280">${value}</text>`,
        );
      }
    }

    // X-axis grid lines and labels (show every 2 hours)
    for (let i = 0; i < 24; i += 2) {
      const x = scaleX(i);
      const label = `${i}:00`;

      // Grid line
      svgElements.push(
        `<line x1="${x}" y1="${chartStartY}" x2="${x}" y2="${chartEndY}" stroke="#f3f4f6" stroke-width="1"/>`,
      );
      // Label (rotate for readability)
      svgElements.push(
        `<text x="${x}" y="${
          chartEndY + 20
        }" font-family="system-ui, -apple-system, sans-serif" font-size="14" text-anchor="middle" fill="#6b7280" transform="rotate(-45, ${x}, ${
          chartEndY + 20
        })">${label}</text>`,
      );
    }

    // Axis lines
    svgElements.push(
      `<line x1="${chartStartX}" y1="${chartStartY}" x2="${chartStartX}" y2="${chartEndY}" stroke="#374151" stroke-width="1.5"/>`,
    ); // Y-axis
    svgElements.push(
      `<line x1="${chartStartX}" y1="${chartEndY}" x2="${chartEndX}" y2="${chartEndY}" stroke="#374151" stroke-width="1.5"/>`,
    ); // X-axis

    // Average line (dashed)
    const avgY = scaleY(averageValue);
    svgElements.push(
      `<line x1="${chartStartX}" y1="${avgY}" x2="${chartEndX}" y2="${avgY}" stroke="#6b7280" stroke-width="2" stroke-opacity="0.7" stroke-dasharray="6,6"/>`,
    );

    // Average value label
    svgElements.push(
      `<text x="${chartEndX + 10}" y="${
        avgY + 5
      }" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" fill="#9ca3af">${averageValue}</text>`,
    );

    // Data line or bars
    if (type === 'line') {
      // Line chart
      let pathData = '';
      const points: Array<{ x: number; y: number; value: number }> = [];

      dataValues.forEach((value, index) => {
        const x = scaleX(index);
        const y = scaleY(value);
        points.push({ x, y, value });

        if (index === 0) {
          pathData += `M ${x} ${y}`;
        } else {
          // Use smooth curve (similar to Chart.js tension: 0.3)
          const prevX = scaleX(index - 1);
          const prevY = scaleY(dataValues[index - 1]);
          const cp1x = prevX + (x - prevX) * 0.3;
          const cp1y = prevY;
          const cp2x = x - (x - prevX) * 0.3;
          const cp2y = y;
          pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
        }
      });

      // Line path
      svgElements.push(
        `<path d="${pathData}" fill="none" stroke="#bef264" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
      );

      // Data points (circles)
      points.forEach((point) => {
        svgElements.push(
          `<circle cx="${point.x}" cy="${point.y}" r="3" fill="#bef264" stroke="#ffffff" stroke-width="1.5"/>`,
        );
      });
    } else {
      // Bar chart
      const barWidth = (chartWidth / 24) * 0.7;
      dataValues.forEach((value, index) => {
        if (value > 0) {
          const x = scaleX(index) - barWidth / 2;
          const barHeight = chartHeight * (value / range);
          const y = chartEndY - barHeight;

          svgElements.push(
            `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#bef264" fill-opacity="0.5" stroke="#bef264" stroke-width="1"/>`,
          );
        }
      });
    }

    // Assemble SVG
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${containerWidth}" height="${containerHeight}" xmlns="http://www.w3.org/2000/svg">
  ${svgElements.join('\n  ')}
</svg>`;

    return svgContent;
  };

  const handleDownloadSVG = () => {
    try {
      const svgContent = generateTrueSVG();

      if (!svgContent) {
        alert(language === 'ja' ? 'グラフデータの取得に失敗しました。' : 'Failed to get chart data.');
        return;
      }

      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const svgDataUrl = URL.createObjectURL(svgBlob);

      const link = document.createElement('a');
      link.download = `${translatedWeekday}_Crowd_Status.svg`;
      link.href = svgDataUrl;
      link.click();

      // Clean up
      setTimeout(() => URL.revokeObjectURL(svgDataUrl), 100);
    } catch (error) {
      console.error('Error downloading SVG:', error);
      alert(
        language === 'ja'
          ? 'SVGのダウンロードに失敗しました。別の方法をお試しください。'
          : 'Failed to download SVG. Please try another method.',
      );
    }
  };

  return (
    <div ref={chartRef} className="w-full h-[300px] bg-white dark:bg-[#334155] rounded-lg shadow-sm border border-gray-200 dark:border-white/20 relative">
      <div className="w-full h-full p-4 pr-10">
        <ChartComponent data={chartData} options={options} />
      </div>
      <div className="absolute right-4" style={{ top: `${topPosition}px`, transform: 'translateY(-50%)' }}>
        <span className="font-bold text-gray-400 dark:text-[#9CA3AF]" style={{ fontSize: '18px' }}>
          {averageValue}
        </span>
      </div>
      <div className="absolute top-2 right-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadSVG}
          className="h-8 w-8 p-0 bg-white/90 dark:bg-[#334155]/90 hover:bg-white dark:hover:bg-[#334155]"
          title={language === 'ja' ? 'SVGとしてダウンロード' : 'Download as SVG'}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
