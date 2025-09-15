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
    <div className={cn("p-6 bg-white rounded-lg shadow-sm border", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="body-small font-medium text-gray-600">{title}</p>
          <h3 className="title-large text-gray-900">{value}</h3>
          {subtitle && (
            <p className="caption text-gray-500">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-lime-50 rounded-lg">
            <div className="text-lime-600">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}