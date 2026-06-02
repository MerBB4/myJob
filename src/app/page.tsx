'use client'

import { TopBar } from '@/components/layout/TopBar'
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { MainContent } from '@/components/layout/MainContent'
import { RightPanel } from '@/components/layout/RightPanel'
import { TerminalPanel } from '@/components/terminal/TerminalPanel'
import { useAppStore } from '@/lib/store'

export default function Home() {
  const showTerminal = useAppStore((s) => s.showTerminal)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <TopBar />

      <div className="flex flex-1 min-h-0">
        <LeftSidebar />
        <MainContent />
        <RightPanel />
      </div>

      {/* Terminal: kept mounted, CSS transition for show/hide */}
      <div
        className={`border-t shrink-0 transition-all duration-200 ${showTerminal ? 'animate-slide-up' : 'h-0 overflow-hidden border-transparent'}`}
        style={showTerminal ? { height: 240, minHeight: 140, maxHeight: 500, resize: 'vertical', overflow: 'hidden' } : undefined}
      >
        <TerminalPanel />
      </div>
    </div>
  )
}
