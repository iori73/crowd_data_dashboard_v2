import { CrowdData } from './dataLoader';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

export interface WeeklyStats {
  weekday: string;
  data: HourlyData[];
  avgCount: number;
  peakHour: number;
  peakCount: number;
}

export interface HourlyData {
  hour: number;
  avgCount: number;
  dataPoints: number;
}

export interface OverallStats {
  totalRecords: number;
  avgCount: number;
  peakTime: string;
  peakWeekday: string;
  peakHour: number;
  peakCount: number;
  quietTime: string;
  quietWeekday: string;
  quietHour: number;
  quietCount: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface FilterState {
  period: 'all' | 'week' | 'month' | 'lastMonth' | 'custom';
  startDate: Date | null;
  endDate: Date | null;
}

export class DataProcessor {
  private static instance: DataProcessor;

  static getInstance(): DataProcessor {
    if (!DataProcessor.instance) {
      DataProcessor.instance = new DataProcessor();
    }
    return DataProcessor.instance;
  }

  filterData(data: CrowdData[], filter: FilterState): CrowdData[] {
    if (filter.period === 'all') {
      return data;
    }

    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (filter.period) {
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'custom':
        if (!filter.startDate || !filter.endDate) {
          return data;
        }
        startDate = filter.startDate;
        endDate = filter.endDate;
        break;
      default:
        return data;
    }

    return data.filter((item) => {
      const itemDate = parseISO(item.date);
      return isWithinInterval(itemDate, { start: startDate, end: endDate });
    });
  }

  processWeeklyData(data: CrowdData[], filter?: FilterState): WeeklyStats[] {
    const filteredData = filter ? this.filterData(data, filter) : data;
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weekdayLabels = {
      'Monday': '月曜日',
      'Tuesday': '火曜日', 
      'Wednesday': '水曜日',
      'Thursday': '木曜日',
      'Friday': '金曜日',
      'Saturday': '土曜日',
      'Sunday': '日曜日'
    };
    const weeklyMap = new Map<string, Map<number, number[]>>();

    // Initialize structure
    weekdays.forEach((day) => {
      weeklyMap.set(day, new Map());
    });

    // Aggregate data
    filteredData.forEach((item) => {
      const hourMap = weeklyMap.get(item.weekday);
      if (hourMap) {
        if (!hourMap.has(item.hour)) {
          hourMap.set(item.hour, []);
        }
        hourMap.get(item.hour)?.push(item.count);
      }
    });

    // Calculate statistics
    return weekdays.map((weekday) => {
      const hourMap = weeklyMap.get(weekday) || new Map();
      const hoursData: HourlyData[] = [];
      let totalCount = 0;
      let dataPoints = 0;
      let peakHour = 0;
      let peakCount = 0;

      for (let hour = 0; hour < 24; hour++) {
        const counts = hourMap.get(hour) || [];
        const avgCount = counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;

        hoursData.push({
          hour,
          avgCount: Math.round(avgCount),
          dataPoints: counts.length,
        });

        if (counts.length > 0) {
          totalCount += avgCount;
          dataPoints += counts.length;

          if (avgCount > peakCount) {
            peakCount = avgCount;
            peakHour = hour;
          }
        }
      }

      const avgCount = dataPoints > 0 ? totalCount / 24 : 0;

      return {
        weekday: weekdayLabels[weekday as keyof typeof weekdayLabels],
        data: hoursData,
        avgCount: Math.round(avgCount),
        peakHour,
        peakCount: Math.round(peakCount),
      };
    });
  }

  calculateOverallStats(data: CrowdData[], filter?: FilterState): OverallStats | null {
    const filteredData = filter ? this.filterData(data, filter) : data;

    if (filteredData.length === 0) {
      return null;
    }

    const totalCount = filteredData.reduce((sum, item) => sum + item.count, 0);
    const avgCount = totalCount / filteredData.length;

    // Find peak and quiet times
    const sortedByCount = [...filteredData].sort((a, b) => b.count - a.count);
    const peak = sortedByCount[0];
    const quiet = sortedByCount[sortedByCount.length - 1];

    // Find date range
    const dates = filteredData.map((item) => item.date).sort();
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    return {
      totalRecords: filteredData.length,
      avgCount: Math.round(avgCount),
      peakTime: `${peak.weekday} ${peak.hour}:00`,
      peakWeekday: peak.weekday,
      peakHour: peak.hour,
      peakCount: peak.count,
      quietTime: `${quiet.weekday} ${quiet.hour}:00`,
      quietWeekday: quiet.weekday,
      quietHour: quiet.hour,
      quietCount: quiet.count,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  }

  getHourlyTrends(data: CrowdData[]): Map<number, number> {
    const hourlyMap = new Map<number, number[]>();

    // Aggregate by hour
    data.forEach((item) => {
      if (!hourlyMap.has(item.hour)) {
        hourlyMap.set(item.hour, []);
      }
      hourlyMap.get(item.hour)?.push(item.count);
    });

    // Calculate averages
    const trends = new Map<number, number>();
    for (let hour = 0; hour < 24; hour++) {
      const counts = hourlyMap.get(hour) || [];
      const avg = counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;
      trends.set(hour, Math.round(avg));
    }

    return trends;
  }
}