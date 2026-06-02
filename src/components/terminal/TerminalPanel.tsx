'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { Terminal, X } from 'lucide-react'
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
          foreground: '#cccccc',
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

      // ResizeObserver ensures fit() only runs when container has real dimensions
      const observer = new ResizeObserver(() => {
        try { fitAddon.fit() } catch { /* container not sized yet */ }
      })
      observer.observe(containerRef.current)
      observerRef.current = observer

      term.writeln('\x1b[1;37m=== 考编笔记 终端 ===\x1b[0m')
      term.writeln('')

      // Try WebSocket connection
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${protocol}//${window.location.host}/ws`
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          setConnected(true)
          term.writeln('\x1b[32m终端已连接\x1b[0m')
        }

        ws.onmessage = (event) => {
          term.write(event.data)
        }

        ws.onclose = () => {
          setConnected(false)
          term.writeln('\x1b[33m终端连接已断开\x1b[0m')
        }

        ws.onerror = () => {
          term.writeln('\x1b[31mWebSocket 未就绪，请点右上角打开本地CMD\x1b[0m')
        }

        term.onData((data: string) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(data)
          }
        })
      } catch {
        term.writeln('\x1b[31mWebSocket 不可用，请使用"打开CMD"启动本地终端\x1b[0m')
      }
    }

    initTerminal()

    return () => {
      cleanedUp = true
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (xtermRef.current && typeof (xtermRef.current as { dispose: () => void }).dispose === 'function') {
        (xtermRef.current as { dispose: () => void }).dispose()
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] min-h-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#2d2d2d] border-b border-[#3c3c3c] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">终端</span>
          {connected && <span className="text-[10px] text-green-400">已连接</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-slate-400 hover:text-white hover:bg-[#3c3c3c] h-6"
            onClick={() => window.open('cmd://', '_blank')}
          >
            <Terminal className="w-3 h-3 mr-1" />
            打开CMD
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-slate-400 hover:text-white"
            onClick={toggleTerminal}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Terminal container */}
      <div ref={containerRef} className="flex-1 min-h-0" />
    </div>
  )
}
