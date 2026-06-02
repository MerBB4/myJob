'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Terminal } from 'lucide-react'
import '@xterm/xterm/css/xterm.css'

export function TerminalPanel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<unknown>(null)
  const fitAddonRef = useRef<unknown>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)

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
          black: '#000000',
          red: '#cd3131',
          green: '#0dbc79',
          yellow: '#e5e510',
          blue: '#2472c8',
          magenta: '#bc3fbc',
          cyan: '#11a8cd',
          white: '#e5e5e5',
          brightBlack: '#666666',
          brightRed: '#f14c4c',
          brightGreen: '#23d18b',
          brightYellow: '#f5f543',
          brightBlue: '#3b8eea',
          brightMagenta: '#d670d6',
          brightCyan: '#29b8db',
          brightWhite: '#ffffff',
        },
        allowProposedApi: true,
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)

      xtermRef.current = term
      fitAddonRef.current = fitAddon

      term.open(containerRef.current)
      fitAddon.fit()

      term.writeln('\x1b[1;37m考编笔记 终端\x1b[0m')
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
          term.writeln('\x1b[31m无法连接到终端服务\x1b[0m')
        }

        term.onData((data: string) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(data)
          }
        })
      } catch {
        term.writeln('\x1b[31mWebSocket不可用，请使用下方按钮打开系统CMD\x1b[0m')
      }

      // Handle resize
      const handleResize = () => {
        if (fitAddonRef.current && typeof (fitAddonRef.current as { fit: () => void }).fit === 'function') {
          (fitAddonRef.current as { fit: () => void }).fit()
        }
      }
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }

    initTerminal()

    return () => {
      cleanedUp = true
      if (xtermRef.current && typeof (xtermRef.current as { dispose: () => void }).dispose === 'function') {
        (xtermRef.current as { dispose: () => void }).dispose()
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const openSystemCmd = () => {
    window.open('cmd://', '_blank')
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#2d2d2d] border-b border-[#3c3c3c] shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
          <span className="text-xs text-slate-400 ml-2">终端</span>
        </div>
        <div className="flex items-center gap-1">
          {connected && (
            <span className="text-[10px] text-green-400">已连接</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-slate-400 hover:text-white hover:bg-[#3c3c3c] h-6"
            onClick={openSystemCmd}
          >
            <Terminal className="w-3 h-3 mr-1" />
            打开CMD
          </Button>
        </div>
      </div>

      {/* Terminal container */}
      <div ref={containerRef} className="flex-1" />
    </div>
  )
}
