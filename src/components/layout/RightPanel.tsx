'use client'

import { useAppStore } from '@/lib/store'
import { AiChat } from '@/components/ai-chat/AiChat'
import { TerminalPanel } from '@/components/terminal/TerminalPanel'
import { Button } from '@/components/ui/button'
import { MessageSquare, Terminal } from 'lucide-react'

export function RightPanel() {
  const { rightPanelMode, setRightPanelMode } = useAppStore()

  return (
    <div className="w-[280px] h-full border-l flex flex-col">
      <div className="flex border-b">
        <Button variant={rightPanelMode === 'ai' ? 'default' : 'ghost'} size="sm" className="flex-1 rounded-none text-xs" onClick={() => setRightPanelMode('ai')}>
          <MessageSquare className="w-3 h-3 mr-1" /> AI
        </Button>
        <Button variant={rightPanelMode === 'terminal' ? 'default' : 'ghost'} size="sm" className="flex-1 rounded-none text-xs" onClick={() => setRightPanelMode('terminal')}>
          <Terminal className="w-3 h-3 mr-1" /> 终端
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        {rightPanelMode === 'ai' ? <AiChat /> : <TerminalPanel />}
      </div>
    </div>
  )
}
