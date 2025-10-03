"use client"

import React from 'react'
import { RefreshCw } from 'lucide-react'

interface FloatingRefreshButtonProps {
  onRefresh: () => void
  loading: boolean
}

export function FloatingRefreshButton({ onRefresh, loading }: FloatingRefreshButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-30 md:hidden">
      <button
        onClick={onRefresh}
        disabled={loading}
        className="
          relative w-14 h-14 rounded-xl
          backdrop-blur-[75px] backdrop-filter
          bg-[rgba(179,179,179,0.82)] dark:bg-[rgba(60,60,60,0.82)]
          shadow-[0px_0px_32px_0px_rgba(0,0,0,0.2)]
          transition-all duration-300 ease-out
          hover:scale-105 hover:bg-[rgba(179,179,179,0.9)] dark:hover:bg-[rgba(60,60,60,0.9)]
          active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          overflow-hidden
          font-['SF_Pro',_-apple-system,_BlinkMacSystemFont,_sans-serif]
        "
      >
        <div className="absolute inset-0" data-name="Material">
          <div className="absolute bg-[rgba(179,179,179,0.82)] dark:bg-[rgba(60,60,60,0.82)] inset-0" />
          <div className="absolute backdrop-blur-[25px] backdrop-filter bg-[#383838] dark:bg-[#2c2c2c] inset-0 mix-blend-color-dodge opacity-50" />
        </div>
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <RefreshCw 
            className={`w-5 h-5 text-black dark:text-white transition-transform duration-300 ${
              loading ? 'animate-spin' : ''
            }`}
          />
        </div>
      </button>
    </div>
  )
}