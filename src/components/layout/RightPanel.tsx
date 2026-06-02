'use client'

import { AiChat } from '@/components/ai-chat/AiChat'

export function RightPanel() {
  return (
    <div className="flex flex-col border-l" style={{ width: 280, minWidth: 240, maxWidth: 420, resize: 'horizontal', overflow: 'auto' }}>
      <AiChat />
    </div>
  )
}
