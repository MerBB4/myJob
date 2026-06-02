'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { X } from 'lucide-react'
import '@xterm/xterm/css/xterm.css'

export function TerminalPanel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<unknown>(null)
  const fitAddonRef = useRef<unknown>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
  const [connected, setConnected] = useState(false)
  const toggleTerminal = useAppStore((s) => s.toggleTerminal)

  useEffect(() => {
    let cleanedUp = false

    const initTerminal = async () => {
      const { Terminal: XtermTerminal } = await import('@xterm/xterm')
      const { FitAddon } = await import('xterm-addon-fit')

      if (cleanedUp || !containerRef.current) return

      const term = new XtermTerminal({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
        theme: {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
          cursor: '#ffffff',
          selectionBackground: '#264f78',
        },
        allowProposedApi: true,
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      xtermRef.current = term
      fitAddonRef.current = fitAddon

      term.open(containerRef.current)

      // ResizeObserver drives fit() — no more crashes
      const observer = new ResizeObserver(() => {
        try { fitAddon.fit() } catch { /* container not sized yet */ }
      })
      observer.observe(containerRef.current)
      observerRef.current = observer

      term.writeln('\x1b[1;37m=== 本地终端 ===\x1b[0m')
      term.writeln('')

      // Connect to WebSocket terminal backend
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${protocol}//${window.location.hostname}:3001`
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          setConnected(true)
          term.writeln('\x1b[32m\xe2\x9c\x93 已连接到本地终端\x1b[0m')
        }

        ws.onmessage = (event) => {
          term.write(event.data)
        }

        ws.onclose = () => {
          setConnected(false)
          term.writeln('\x1b[33m终端已断开\x1b[0m')
        }

        ws.onerror = () => {
          term.writeln('\x1b[31m无法连接终端服务 — 请确保 start-dev.bat 已启动 ws 服务\x1b[0m')
        }

        term.onData((data: string) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(data)
          }
        })
      } catch {
        term.writeln('\x1b[31mWebSocket 不可用\x1b[0m')
      }
    }

    initTerminal()

    return () => {
      cleanedUp = true
      if (observerRef.current) observerRef.current.disconnect()
      if (xtermRef.current && typeof (xtermRef.current as { dispose: () => void }).dispose === 'function') {
        (xtermRef.current as { dispose: () => void }).dispose()
      }
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] min-h-0">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#2d2d2d] border-b border-[#3c3c3c] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#999]">终端</span>
          {connected && <span className="w-2 h-2 rounded-full bg-green-500" title="已连接" />}
        </div>
        <Button
          variant="ghost" size="icon"
          className="h-6 w-6 text-[#999] hover:text-white hover:bg-[#3c3c3c]"
          onClick={toggleTerminal}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      <div ref={containerRef} className="flex-1 min-h-0" />
    </div>
  )
}
