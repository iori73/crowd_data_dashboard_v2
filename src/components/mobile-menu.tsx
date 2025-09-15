"use client"

import React, { useEffect, useState } from 'react'
import { X, Download, Globe, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Language, useTranslation } from '@/lib/translations'
import { FilterState } from '@/lib/dataProcessor'
import { useTheme } from 'next-themes'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
  onExportCSV: () => void
  dataLength: number
  currentFilter: FilterState
  onQuickFilter: (period: 'all' | 'week' | 'month' | 'lastMonth') => void
  chartType: 'line' | 'bar'
  onChartTypeChange: (type: 'line' | 'bar') => void
}

export function MobileMenu({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
  onExportCSV,
  dataLength,
  currentFilter,
  onQuickFilter,
  chartType,
  onChartTypeChange
}: MobileMenuProps) {
  const { t } = useTranslation(currentLanguage)
  const { theme, setTheme } = useTheme()
  const [shouldRender, setShouldRender] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Handle mount/unmount with animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      // Small delay to ensure DOM is ready for animation
      const timeout = setTimeout(() => {
        setIsAnimating(true)
      }, 10)
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      
      return () => clearTimeout(timeout)
    } else {
      setIsAnimating(false)
      // Wait for animation to complete before unmounting
      const timeout = setTimeout(() => {
        setShouldRender(false)
      }, 400) // Match animation duration
      
      // Restore body scroll
      document.body.style.overflow = 'unset'
      
      return () => clearTimeout(timeout)
    }
  }, [isOpen])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  if (!shouldRender) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-400 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="absolute inset-0 flex justify-end">
        <div 
          className={`w-[240px] h-full bg-[#1e2939] shadow-2xl transition-transform duration-400 ease-out ${
            isAnimating ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            transform3d: 'translateZ(0)'
          }}
        >
          <div className="flex flex-col h-full">
            {/* Header with smooth fade-in */}
            <div className={`flex items-center justify-between p-4 border-b border-white/10 transition-opacity duration-500 delay-100 ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}>
              <h2 className="text-lg font-semibold text-white">メニュー</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 text-white hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Menu Items with staggered animation */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-6 transition-all duration-500 delay-200 ${
              isAnimating ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}>
              {/* CSV Download */}
              <div className="flex flex-col gap-2">
                <button
                  className="flex items-center gap-1 text-white text-[16px] font-normal px-0 py-0 hover:opacity-80 transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95"
                  onClick={() => {
                    onExportCSV()
                    onClose()
                  }}
                  disabled={dataLength === 0}
                >
                  <Download className="w-4 h-4" />
                  <span>CSVダウンロード</span>
                </button>
              </div>

              {/* Language Settings */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1 text-white text-[16px] font-normal">
                  <Globe className="w-4 h-4" />
                  <span>言語</span>
                </div>
                <div className="flex flex-col gap-0">
                  <button
                    className={`w-full text-left px-2 py-2 rounded-lg text-[14px] font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      currentLanguage === 'ja'
                        ? 'bg-[#364153] text-white shadow-lg'
                        : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => {
                      onLanguageChange('ja')
                      onClose()
                    }}
                  >
                    日本語
                  </button>
                  <button
                    className={`w-full text-left px-2 py-2 rounded-lg text-[14px] font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      currentLanguage === 'en'
                        ? 'bg-[#364153] text-white shadow-lg'
                        : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => {
                      onLanguageChange('en')
                      onClose()
                    }}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Theme Settings */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1 text-white text-[16px] font-normal">
                  <Palette className="w-4 h-4" />
                  <span>モード</span>
                </div>
                <div className="flex flex-col gap-0">
                  <button 
                    className={`w-full text-left px-2 py-2 rounded-lg text-[14px] font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      theme === 'light'
                        ? 'bg-[#364153] text-white shadow-lg'
                        : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => {
                      setTheme('light')
                      onClose()
                    }}
                  >
                    Light
                  </button>
                  <button 
                    className={`w-full text-left px-2 py-2 rounded-lg text-[14px] font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      theme === 'dark'
                        ? 'bg-[#364153] text-white shadow-lg'
                        : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => {
                      setTheme('dark')
                      onClose()
                    }}
                  >
                    Dark
                  </button>
                  <button 
                    className={`w-full text-left px-2 py-2 rounded-lg text-[14px] font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      theme === 'system'
                        ? 'bg-[#364153] text-white shadow-lg'
                        : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => {
                      setTheme('system')
                      onClose()
                    }}
                  >
                    System
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}