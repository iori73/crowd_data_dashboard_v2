import React from 'react';
import { cn } from '@/lib/utils';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatisticsCard({ title, value, subtitle, icon, className }: StatisticsCardProps) {
  return (
    <div
      className={cn(
        'p-4 sm:p-6 bg-white dark:bg-[#334155] rounded-lg shadow-sm border border-gray-200 dark:border-white/20',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <div className="space-y-2 flex-1 min-w-0">
          <p className="body-small font-medium text-gray-600 dark:text-[#E5E7EB]">{title}</p>
          <h3 className="title-large text-gray-900 dark:text-white break-words">{value}</h3>
          {subtitle && <p className="caption text-gray-500 dark:text-[#E5E7EB] break-words">{subtitle}</p>}
        </div>
        {icon && (
          <div className="p-2 bg-lime-50 dark:bg-[#F7FEE7] rounded-lg flex-shrink-0 ml-auto">
            <div className="text-lime-600 dark:text-lime-600">{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
}
