const NAV = [
  {
    id: 'upload',
    label: 'Upload',
    desc: 'Load a CSV file',
    icon: (
      <path d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
    ),
  },
  {
    id: 'summary',
    label: 'Summary',
    desc: 'Column statistics',
    icon: <path d="M4 19V9m5 10V5m5 14v-6m5 6V11" />,
  },
  {
    id: 'charts',
    label: 'Visualizations',
    desc: 'Auto-generated charts',
    icon: (
      <path d="M12 3a9 9 0 1 0 9 9h-9V3ZM15 3.5A9 9 0 0 1 20.5 9H15V3.5Z" />
    ),
  },
  {
    id: 'quality',
    label: 'Quality Report',
    desc: 'Health & actions',
    icon: (
      <path d="m9 12 2 2 4-4m5 2a8 8 0 1 1-16 0c0-2.5 1-4 1-4l3-4h8l3 4s1 1.5 1 4Z" />
    ),
  },
]

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-signal-500 font-mono text-sm font-semibold text-ink-950">
        ▙▟
      </div>
      <div>
        <p className="text-[15px] font-extrabold tracking-tight text-white">
          CSV ANALYZER
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
          data console
        </p>
      </div>
    </div>
  )
}

export default function Sidebar({
  view,
  onNavigate,
  hasData,
  meta,
  onReset,
  menuOpen,
  setMenuOpen,
}) {
  const nav = (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map((item, i) => {
        const active = view === item.id
        const disabled = !hasData && item.id !== 'upload'
        return (
          <button
            key={item.id}
            onClick={() => !disabled && onNavigate(item.id)}
            disabled={disabled}
            className={[
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200',
              active
                ? 'bg-ink-700 text-white shadow-lg shadow-black/30'
                : disabled
                  ? 'cursor-not-allowed text-ink-400/50'
                  : 'text-ink-300 hover:bg-ink-800 hover:text-white',
            ].join(' ')}
          >
            <span
              className={[
                'font-mono text-[10px]',
                active ? 'text-signal-500' : 'text-ink-400',
              ].join(' ')}
            >
              0{i + 1}
            </span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={['h-[18px] w-[18px] shrink-0', active ? 'text-signal-500' : ''].join(' ')}
            >
              {item.icon}
            </svg>
            <span className="flex-1">
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="block text-[11px] text-ink-400 group-hover:text-ink-300">
                {item.desc}
              </span>
            </span>
            {active && <span className="h-1.5 w-1.5 rounded-full bg-signal-500" />}
          </button>
        )
      })}
    </nav>
  )

  const datasetCard = meta && (
    <div className="mx-3 rounded-lg border border-ink-700 bg-ink-800/60 p-3">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-signal-500">
        ● Dataset loaded
      </p>
      <p className="truncate text-xs font-semibold text-white" title={meta.filename}>
        {meta.filename}
      </p>
      <p className="mt-1 font-mono text-[11px] text-ink-300">
        {meta.rowCount.toLocaleString()} rows · {meta.colCount} cols ·{' '}
        {formatBytes(meta.sizeBytes)}
      </p>
      <button
        onClick={onReset}
        className="mt-2 w-full rounded-md border border-ink-700 px-2 py-1 text-[11px] font-medium text-ink-300 transition-colors hover:border-signal-500 hover:text-signal-500"
      >
        Clear dataset
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-ink-900 px-4 py-3 lg:hidden">
        <Logo />
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          className="rounded-md border border-ink-700 p-2 text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
            {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </header>
      {menuOpen && (
        <div className="z-40 bg-ink-900 pb-4 lg:hidden">
          {nav}
          <div className="mt-3">{datasetCard}</div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col justify-between bg-ink-900 lg:flex">
        <div>
          <div className="border-b border-ink-800 px-6 py-6">
            <Logo />
          </div>
          <div className="mt-5">{nav}</div>
        </div>
        <div className="pb-5">
          {datasetCard}
          <p className="mt-4 px-6 font-mono text-[10px] text-ink-400">
            All processing happens in your browser.
            <br />
            No data leaves this machine.
          </p>
        </div>
      </aside>
    </>
  )
}
