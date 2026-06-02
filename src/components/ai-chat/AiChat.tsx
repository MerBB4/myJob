'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2, Settings, X } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [model, setModel] = useState('deepseek-chat')
  const [baseUrl, setBaseUrl] = useState('https://api.deepseek.com')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/config')
        if (res.ok) {
          const data: Record<string, string> = await res.json()
          setModel(data.ai_model || 'deepseek-chat')
          setBaseUrl(data.ai_base_url || 'https://api.deepseek.com')
        }
      } catch {
        // silent
      }
    }
    loadConfig()
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'AI请求失败')
      }

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : '请求失败'
      toast.error(errMsg)
      setMessages(prev => [...prev, { role: 'assistant', content: `[错误] ${errMsg}` }])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading])

  const saveConfig = async () => {
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'ai_model', value: model }),
      })
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'ai_base_url', value: baseUrl }),
      })
      toast.success('配置已保存')
      setShowSettings(false)
    } catch {
      toast.error('保存配置失败')
    }
  }

  return (
    <div className="h-full flex flex-col bg-surface-low">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b">
        <span className="text-sm font-medium text-on-surface">AI 助手</span>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-on-surface-variant" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="p-3 border-b bg-surface space-y-2.5 animate-slide-down">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-on-surface">设置</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowSettings(false)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-xs text-on-surface-variant">
            API Key 请在 <code className="bg-surface-high px-1 rounded">.env</code> 中配置 <code className="bg-surface-high px-1 rounded">AI_API_KEY</code>
          </p>
          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">模型</label>
            <Input
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="deepseek-chat"
              className="text-sm h-8"
            />
          </div>
          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Base URL</label>
            <Input
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              placeholder="https://api.deepseek.com"
              className="text-sm h-8"
            />
          </div>
          <Button size="sm" className="w-full text-sm h-8" onClick={saveConfig}>保存配置</Button>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-sm text-on-surface-variant py-12">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>发送消息开始对话</p>
              <p className="text-xs mt-1">API Key 请在 .env 中配置</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-accent text-white'
                    : 'bg-surface border text-on-surface'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-surface rounded-lg px-3 py-2 border">
                <Loader2 className="w-4 h-4 animate-spin text-on-surface-variant" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t bg-surface">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="输入问题..."
            className="text-sm h-9 flex-1"
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
