// Small shared building blocks used across views.

export function PageHeader({ kicker, title, children }) {
  return (
    <div className="rise mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-signal-600">
          {kicker}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          {title}
        </h1>
      </div>
      {children}
    </div>
  )
}

export function TypeBadge({ type }) {
  const styles = {
    numeric: 'bg-teal-flux/15 text-teal-700 border-teal-flux/40',
    text: 'bg-signal-500/15 text-signal-600 border-signal-500/40',
    date: 'bg-ink-700/10 text-ink-700 border-ink-700/30',
  }
  return (
    <span
      className={`inline-block rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${styles[type] || styles.text}`}
    >
      {type}
    </span>
  )
}

export function ExportButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border-2 border-ink-900 bg-white px-4 py-2 text-sm font-bold text-ink-900 shadow-[3px_3px_0_0_var(--color-ink-900)] transition-all hover:-translate-y-0.5 hover:shadow-[4px_5px_0_0_var(--color-ink-900)] active:translate-y-0 active:shadow-[2px_2px_0_0_var(--color-ink-900)]"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M12 4v12m0 0 4-4m-4 4-4-4M4 20h16" />
      </svg>
      {children}
    </button>
  )
}

// Shown when a data view is opened with no dataset loaded.
export function NoData({ onLoadSample, goUpload }) {
  return (
    <div className="rise mx-auto mt-16 max-w-md rounded-2xl border-2 border-dashed border-ink-900/20 bg-white/60 p-10 text-center">
      <p className="font-mono text-4xl">⊘</p>
      <h2 className="mt-3 text-xl font-extrabold text-ink-900">No dataset loaded</h2>
      <p className="mt-2 text-sm text-ink-700/70">
        Upload a CSV file or load the built-in sample dataset to see this view.
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <button
          onClick={goUpload}
          className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          Go to Upload
        </button>
        <button
          onClick={onLoadSample}
          className="rounded-lg border-2 border-ink-900 px-4 py-2 text-sm font-bold text-ink-900 transition-transform hover:-translate-y-0.5"
        >
          Load sample
        </button>
      </div>
    </div>
  )
}
