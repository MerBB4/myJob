import { WebSocketServer } from 'ws'
import { spawn } from 'node-pty'
import { createServer } from 'http'

const PORT = 3001
const HOST = '127.0.0.1'
const isWindows = process.platform === 'win32'
const shell = isWindows ? 'powershell.exe' : (process.env.SHELL || 'bash')
const shellArgs = isWindows ? [] : []

// Only pass safe environment variables to the shell
const SAFE_ENV_KEYS = [
  'PATH', 'HOME', 'USER', 'USERNAME', 'TERM', 'SHELL',
  'SystemRoot', 'TEMP', 'TMP', 'TMPDIR',
  'LANG', 'LC_ALL', 'COLORTERM',
  'APPDATA', 'LOCALAPPDATA', 'ProgramFiles', 'ProgramData',
]
const safeEnv = {}
for (const key of SAFE_ENV_KEYS) {
  if (process.env[key] !== undefined) {
    safeEnv[key] = process.env[key]
  }
}

const server = createServer((req, res) => {
  res.writeHead(200)
  res.end('terminal ws server')
})

const wss = new WebSocketServer({ server })

wss.on('connection', (ws) => {
  console.log('[terminal] client connected')

  const pty = spawn(shell, shellArgs, {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.cwd(),
    env: { ...safeEnv, TERM: 'xterm-color' },
  })

  pty.onData((data) => {
    try { ws.send(data) } catch {}
  })

  ws.on('message', (data) => {
    try { pty.write(data.toString()) } catch {}
  })

  ws.on('close', () => {
    console.log('[terminal] client disconnected')
    try { pty.kill() } catch {}
  })

  ws.on('error', () => {
    try { pty.kill() } catch {}
  })
})

server.listen(PORT, HOST, () => {
  console.log(`[terminal] ws server on ws://${HOST}:${PORT}`)
})
