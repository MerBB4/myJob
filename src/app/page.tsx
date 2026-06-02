'use client'

import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { MainContent } from '@/components/layout/MainContent'
import { RightPanel } from '@/components/layout/RightPanel'
import { TerminalPanel } from '@/components/terminal/TerminalPanel'
import { useAppStore } from '@/lib/store'

export default function Home() {
  const showTerminal = useAppStore((s) => s.showTerminal)

  return (
    <div className="flex flex-col h-full">
      {/* Top: three columns */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <LeftSidebar />
        <MainContent />
        <RightPanel />
      </div>

      {/* Bottom: terminal (toggleable) */}
      {showTerminal && (
        <div className="h-[220px] border-t shrink-0" style={{ minHeight: 120, maxHeight: 480, resize: 'vertical', overflow: 'hidden' }}>
          <TerminalPanel />
        </div>
      )}
    </div>
  )
}
