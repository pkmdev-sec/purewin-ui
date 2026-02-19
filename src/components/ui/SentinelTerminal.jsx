import { useState, useRef, useEffect, useCallback } from 'react'

const COMMANDS = {
  help: `
PureWin v1.0.0 - Windows Optimization Toolkit

COMMANDS:
  pw clean [--dry-run]    Deep system cleanup
  pw uninstall <app>      Complete app removal
  pw analyze              Disk space analysis
  pw status               System health overview
  pw optimize             Full optimization pass
  pw purge                Remove all cached data
  pw update               Check for updates
  pw version              Show version info
  pw clear                Clear terminal
  pw help                 Show this message

FLAGS:
  --dry-run               Preview changes without executing
  --force                 Skip confirmation prompts
  --verbose               Detailed output`,

  clean: `
[SCAN] Scanning system for cleanup targets...
  > Temp files:        847 files (2.3 GB)
  > Browser caches:    312 files (1.1 GB)
  > System logs:       156 files (489 MB)
  > Thumbnail cache:   2,841 files (234 MB)
  > Windows Update:    23 packages (1.8 GB)

[DRY-RUN] Total reclaimable: 5.9 GB across 4,179 items
[DRY-RUN] No changes made. Remove --dry-run to execute.`,

  analyze: `
[SCAN] Analyzing disk usage on C:\\...

  C:\\Users\\           42.3 GB  ████████████░░░░  45%
  C:\\Windows\\          18.7 GB  ██████░░░░░░░░░░  20%
  C:\\Program Files\\    12.1 GB  ████░░░░░░░░░░░░  13%
  C:\\ProgramData\\       8.4 GB  ██░░░░░░░░░░░░░░   9%
  C:\\Dev\\               6.2 GB  ██░░░░░░░░░░░░░░   7%
  Other                 5.8 GB  █░░░░░░░░░░░░░░░   6%

[INFO] Total used: 93.5 GB / 256 GB (36.5%)
[TIP] Run 'pw clean' to reclaim ~5.9 GB`,

  status: `
[SYSTEM] PureWin Health Report

  CPU:      Intel i7-13700K @ 5.4 GHz    [OK]
  Memory:   16.4 / 32 GB (51%)           [OK]
  Disk:     93.5 / 256 GB (36.5%)        [OK]
  Network:  1 Gbps (Ethernet)            [OK]
  GPU:      NVIDIA RTX 4070 Ti           [OK]
  Uptime:   3d 14h 22m

[HEALTH] System score: 94/100
[INFO] All metrics within normal range.`,

  uninstall: `
[SEARCH] Looking for matching applications...
  > Found: Example App v3.2.1

[SCAN] Scanning for traces...
  > Registry entries:   14 keys found
  > AppData remnants:   3 folders (48 MB)
  > ProgramData:        1 folder (12 MB)
  > Scheduled tasks:    2 entries

[DRY-RUN] Would remove app + 14 registry keys + 60 MB remnants
[DRY-RUN] No changes made. Use --force to execute.`,

  optimize: `
[START] Running full optimization pass...

  [1/5] Cleaning temp files.............. done (2.3 GB freed)
  [2/5] Clearing browser caches......... done (1.1 GB freed)
  [3/5] Removing orphan registry keys... done (847 keys)
  [4/5] Defragmenting databases......... done
  [5/5] Optimizing startup items........ done (3 items disabled)

[DONE] Optimization complete.
  > Space reclaimed: 3.4 GB
  > Registry cleaned: 847 orphaned keys removed
  > Boot time improved: ~2.1s faster`,

  purge: `
[WARN] Purge mode: removes ALL cached data.

  Browser caches:     1.1 GB
  Shader caches:      890 MB
  Thumbnail caches:   234 MB
  DNS cache:          flush
  Font cache:         rebuild

[DRY-RUN] Total purge: 2.2 GB
[DRY-RUN] No changes made. Add --force to execute.`,

  update: `
[CHECK] Checking for updates...
  > Current: v1.0.0
  > Latest:  v1.0.0

[INFO] You are running the latest version.`,

  version: `PureWin v1.0.0
Build: 2025-01-15
Go: 1.23.0
OS: windows/amd64
Repo: github.com/lakshaymdev/purewin`,
}

export default function SentinelTerminal({ autoPlay = false }) {
  const [lines, setLines] = useState([
    { type: 'system', text: 'PureWin Terminal v1.0.0' },
    { type: 'system', text: 'Type "help" for available commands.\n' },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [history, setHistory] = useState([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const termRef = useRef(null)
  const inputRef = useRef(null)
  const autoPlayRef = useRef(false)

  const scrollToBottom = useCallback(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight
    }
  }, [])

  const typewriterOutput = useCallback((text, callback) => {
    setTyping(true)
    const chars = text.split('')
    let idx = 0
    let buffer = ''

    function step() {
      if (idx < chars.length) {
        buffer += chars[idx]
        idx++
        const chunk = 3 + Math.floor(Math.random() * 5)
        for (let i = 1; i < chunk && idx < chars.length; i++) {
          buffer += chars[idx]
          idx++
        }
        setLines((prev) => {
          const next = [...prev]
          if (next[next.length - 1]?.type === 'output-typing') {
            next[next.length - 1] = { type: 'output-typing', text: buffer }
          } else {
            next.push({ type: 'output-typing', text: buffer })
          }
          return next
        })
        setTimeout(step, 10 + Math.random() * 15)
      } else {
        setLines((prev) => {
          const next = [...prev]
          if (next[next.length - 1]?.type === 'output-typing') {
            next[next.length - 1] = { type: 'output', text: buffer }
          }
          return next
        })
        setTyping(false)
        if (callback) callback()
      }
    }

    step()
  }, [])

  const executeCommand = useCallback((cmd, callback) => {
    const trimmed = cmd.trim().toLowerCase()
    const parts = trimmed.replace(/^pw\s*/, '').split(/\s+/)
    const command = parts[0] || ''

    if (command === 'clear') {
      setLines([
        { type: 'system', text: 'PureWin Terminal v1.0.0' },
        { type: 'system', text: 'Type "help" for available commands.\n' },
      ])
      if (callback) callback()
      return
    }

    const output = COMMANDS[command]
    if (output) {
      typewriterOutput(output, callback)
    } else if (command) {
      setLines((prev) => [
        ...prev,
        { type: 'error', text: `  Unknown command: "${cmd}". Type "help" for usage.` },
      ])
      if (callback) callback()
    } else {
      if (callback) callback()
    }
  }, [typewriterOutput])

  function handleSubmit(e) {
    e.preventDefault()
    if (typing || !input.trim()) return

    const cmd = input.trim()
    setLines((prev) => [...prev, { type: 'input', text: cmd }])
    setHistory((prev) => [cmd, ...prev])
    setHistoryIdx(-1)
    setInput('')
    executeCommand(cmd)
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0) {
        const next = Math.min(historyIdx + 1, history.length - 1)
        setHistoryIdx(next)
        setInput(history[next])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIdx > 0) {
        const next = historyIdx - 1
        setHistoryIdx(next)
        setInput(history[next])
      } else {
        setHistoryIdx(-1)
        setInput('')
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [lines, scrollToBottom])

  useEffect(() => {
    if (!autoPlay || autoPlayRef.current) return
    autoPlayRef.current = true

    const demoCommands = ['pw help', 'pw clean --dry-run', 'pw status']
    let cmdIdx = 0

    function playNext() {
      if (cmdIdx >= demoCommands.length) return
      const cmd = demoCommands[cmdIdx]
      cmdIdx++

      setTimeout(() => {
        setLines((prev) => [...prev, { type: 'input', text: cmd }])
        executeCommand(cmd, () => {
          setTimeout(playNext, 1500)
        })
      }, 1000)
    }

    setTimeout(playNext, 500)
  }, [autoPlay, executeCommand])

  return (
    <div
      style={{
        backgroundColor: 'rgba(5, 6, 10, 0.95)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '12px',
        overflow: 'hidden',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
        lineHeight: 1.6,
        maxWidth: '100%',
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '10px 10px 0 0',
        }}
      >
        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '8px', letterSpacing: '0.1em' }}>pw — terminal</span>
      </div>

      {/* Terminal body */}
      <div
        ref={termRef}
        onClick={() => inputRef.current?.focus()}
        style={{
          padding: '16px',
          height: '400px',
          overflowY: 'auto',
          cursor: 'text',
        }}
      >
        {lines.map((line, i) => (
          <div key={i} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {line.type === 'input' ? (
              <span>
                <span style={{ color: 'var(--xp-green)' }}>pw &gt; </span>
                <span style={{ color: 'var(--text-primary)' }}>{line.text}</span>
              </span>
            ) : line.type === 'error' ? (
              <span style={{ color: '#ff5f57' }}>{line.text}</span>
            ) : line.type === 'system' ? (
              <span style={{ color: 'var(--text-muted)' }}>{line.text}</span>
            ) : (
              <span style={{ color: '#a78bfa', opacity: 0.9 }}>{line.text}</span>
            )}
          </div>
        ))}

        {/* Input line */}
        {!autoPlay && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: 'var(--xp-green)', whiteSpace: 'nowrap' }}>pw &gt; </span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={typing}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                caretColor: 'var(--xp-green)',
              }}
            />
            <span
              style={{
                width: '7px',
                height: '14px',
                backgroundColor: 'var(--xp-green)',
                animation: 'blink 1s step-end infinite',
                marginLeft: '2px',
              }}
            />
          </form>
        )}
      </div>
    </div>
  )
}
