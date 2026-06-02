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

interface ConfigData {
  ai_provider?: string
  ai_api_key?: string
  ai_model?: string
  ai_base_url?: string
}

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [config, setConfig] = useState<ConfigData>({})
  const [apiKey, setApiKey] = useState('')
  const [provider, setProvider] = useState('deepseek')
  const [model, setModel] = useState('deepseek-chat')
  const [baseUrl, setBaseUrl] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/config')
        if (res.ok) {
          const data: Record<string, string> = await res.json()
          setConfig(data)
          setApiKey(data.ai_api_key || '')
          setProvider(data.ai_provider || 'deepseek')
          setModel(data.ai_model || 'deepseek-chat')
          setBaseUrl(data.ai_base_url || '')
          // Auto-show settings panel if no API key configured yet
          if (!data.ai_api_key) {
            setShowSettings(true)
          }
        }
      } catch {
        // Config not critical, silent fail
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
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'AI请求失败')
      }

      const data = await res.json()
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.content || data.message || data.data || '无响应',
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '请求失败，请检查配置'
      toast.error(message)
      const errMsg: Message = { role: 'assistant', content: `[错误] ${message}` }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages])

  const saveConfig = async () => {
    try {
      const configs = [
        { key: 'ai_provider', value: provider },
        { key: 'ai_api_key', value: apiKey },
        { key: 'ai_model', value: model },
        { key: 'ai_base_url', value: baseUrl },
      ]

      for (const c of configs) {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(c),
        })
      }
      toast.success('配置已保存')
      setShowSettings(false)
    } catch {
      toast.error('保存配置失败')
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-xs font-medium text-slate-500">AI 助手</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="w-3 h-3" />
        </Button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="p-3 border-b bg-slate-50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">设置</span>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowSettings(false)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-[11px] text-slate-500 mb-0.5 block">提供商</label>
              <select
                value={provider}
                onChange={e => setProvider(e.target.value)}
                className="w-full text-xs h-7 rounded border px-2 bg-white"
              >
                <option value="deepseek">DeepSeek</option>
                <option value="openai">OpenAI</option>
                <option value="qwen">通义千问</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 mb-0.5 block">API Key</label>
              <Input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="text-xs h-7"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 mb-0.5 block">模型</label>
              <Input
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="deepseek-chat"
                className="text-xs h-7"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 mb-0.5 block">Base URL</label>
              <Input
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
                placeholder="https://api.deepseek.com"
                className="text-xs h-7"
              />
            </div>
            <Button size="sm" className="w-full text-xs h-7" onClick={saveConfig}>
              保存配置
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-xs text-slate-400 py-8">
              发送消息开始对话
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                  msg.role === 'user'
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-lg px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-2 border-t">
        <div className="flex gap-1">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="输入问题..."
            className="text-xs h-8 flex-1"
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="h-8 w-8"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
