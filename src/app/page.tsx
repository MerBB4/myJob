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

      {showTerminal && (
        <div
          className="border-t shrink-0 animate-slide-up"
          style={{ height: 240, minHeight: 140, maxHeight: 500, resize: 'vertical', overflow: 'hidden' }}
        >
          <TerminalPanel />
        </div>
      )}
    </div>
  )
}
