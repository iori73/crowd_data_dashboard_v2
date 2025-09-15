import React from 'react'
import { cn } from '@/lib/utils'

interface StatisticsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  className?: string
}

export function StatisticsCard({
  title,
  value,
  subtitle,
  icon,
  className,
}: StatisticsCardProps) {
  return (
    <div className={cn("p-4 sm:p-6 bg-white rounded-lg shadow-sm border", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2 min-w-0 flex-1">
          <p className="body-small font-medium text-gray-600">{title}</p>
          <h3 className="title-large text-gray-900 break-words">{value}</h3>
          {subtitle && (
            <p className="caption text-gray-500 break-words">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-lime-50 rounded-lg flex-shrink-0">
            <div className="text-lime-600">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}