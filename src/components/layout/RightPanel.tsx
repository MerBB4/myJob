'use client'

import { AiChat } from '@/components/ai-chat/AiChat'

export function RightPanel() {
  return (
    <div style={{ direction: 'rtl', width: 300, minWidth: 260, maxWidth: 440, resize: 'horizontal', overflow: 'auto' }}>
      <div className="flex flex-col border-l bg-surface-low h-full" style={{ direction: 'ltr' }}>
        <AiChat />
      </div>
    </div>
  )
}
