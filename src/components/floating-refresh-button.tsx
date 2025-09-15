"use client"

import React from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FloatingRefreshButtonProps {
  onRefresh: () => void
  loading: boolean
}

export function FloatingRefreshButton({ onRefresh, loading }: FloatingRefreshButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-30 md:hidden">
      <Button
        onClick={onRefresh}
        disabled={loading}
        size="lg"
        className="w-14 h-14 rounded-full shadow-2xl bg-lime-600 hover:bg-lime-700 dark:bg-lime-500 dark:hover:bg-lime-600 text-white border-0 transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <RefreshCw 
          className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`}
        />
      </Button>
    </div>
  )
}