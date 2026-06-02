'use client'

import { AiChat } from '@/components/ai-chat/AiChat'

export function RightPanel() {
  return (
    <div className="flex flex-col border-l bg-surface-low" style={{ width: 300, minWidth: 260, maxWidth: 440, resize: 'horizontal', overflow: 'auto' }}>
      <AiChat />
    </div>
  )
}
