"use client"

import * as React from "react"
import { type DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { ja, enUS } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Language, useTranslation } from "@/lib/translations"

interface CalendarFilterProps {
  onFilterChange: (startDate: Date | null, endDate: Date | null) => void
  className?: string
  language?: Language
}

export function CalendarFilter({ onFilterChange, className, language = 'ja' }: CalendarFilterProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()
  const [isOpen, setIsOpen] = React.useState(false)
  const { t } = useTranslation(language)
  const locale = language === 'ja' ? ja : enUS

  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range)
  }

  const handleApply = () => {
    if (dateRange?.from && dateRange?.to) {
      onFilterChange(dateRange.from, dateRange.to)
      setIsOpen(false)
    }
  }

  const handleClear = () => {
    setDateRange(undefined)
    onFilterChange(null, null)
    setIsOpen(false)
  }

  const formatDateRange = () => {
    if (!dateRange?.from) return t('selectPeriod')
    if (!dateRange?.to) return format(dateRange.from, "yyyy/MM/dd", { locale })
    return `${format(dateRange.from, "yyyy/MM/dd", { locale })} - ${format(dateRange.to, "yyyy/MM/dd", { locale })}`
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[300px] justify-start text-left font-normal",
            !dateRange && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base">{t('customPeriod')}</h3>
            {dateRange && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 px-2 text-sm"
              >
                <X className="h-3 w-3 mr-1" />
                {t('clear')}
              </Button>
            )}
          </div>
        </div>
        <Calendar
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={2}
          locale={locale}
          className="p-3"
        />
        <div className="p-3 border-t flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            {t('cancel')}
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={!dateRange?.from || !dateRange?.to}
          >
            {t('apply')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}