import { useRef, useState } from 'react'
import { PageHeader, TypeBadge } from './shared.jsx'
import { isEmpty } from '../lib/analyze.js'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function MetaTile({ label, value }) {
  return (
    <div className="rounded-xl border border-ink-900/10 bg-white p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-700/50">
        {label}
      </p>
      <p className="mt-1 truncate font-mono text-lg font-semibold text-ink-900" title={String(value)}>
        {value}
      </p>
    </div>
  )
}

export default function UploadView({
  dataset,
  columns,
  error,
  onFile,
  onLoadSample,
  onContinue,
}) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    onFile(e.dataTransfer.files?.[0])
  }

  const typeByField = Object.fromEntries(columns.map((c) => [c.name, c.type]))

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader kicker="Step 01 — Input" title="Upload your data" />

      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          'rise rise-1 group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 sm:p-14',
          dragging
            ? 'border-signal-500 bg-signal-500/10 scale-[1.01]'
            : 'border-ink-900/25 bg-white hover:border-signal-500 hover:bg-signal-500/5',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <div
          className={[
            'pulse-ring mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-ink-900 text-signal-500 transition-transform duration-300',
            dragging ? 'scale-110 rotate-6' : 'group-hover:scale-105',
          ].join(' ')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <path d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
          </svg>
        </div>
        <h2 className="mt-5 text-xl font-extrabold text-ink-900">
          {dragging ? 'Drop it!' : 'Drag & drop a CSV file here'}
        </h2>
        <p className="mt-1.5 text-sm text-ink-700/60">
          or <span className="font-semibold text-signal-600 underline underline-offset-2">click to browse</span> —
          parsing happens locally in your browser
        </p>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-700/40">
          .csv with header row · any size your browser can hold
        </p>
      </div>

      {/* Sample dataset CTA */}
      <div className="rise rise-2 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink-900 p-5 text-white">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl text-signal-500">✦</span>
          <div>
            <p className="text-sm font-bold">No file handy? Demo it instantly.</p>
            <p className="text-xs text-ink-300">
              Built-in dataset: 80 fictional IT operations incidents (priorities, teams, resolution times).
            </p>
          </div>
        </div>
        <button
          onClick={onLoadSample}
          className="rounded-lg bg-signal-500 px-4 py-2 text-sm font-bold text-ink-950 transition-all hover:-translate-y-0.5 hover:bg-signal-600"
        >
          Load sample dataset
        </button>
      </div>

      {error && (
        <div role="alert" className="rise mt-4 rounded-xl border-2 border-red-600/40 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          ⚠ {error}
        </div>
      )}

      {/* After load: metadata + preview */}
      {dataset && (
        <section className="mt-10">
          <div className="rise rise-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetaTile label="Filename" value={dataset.meta.filename} />
            <MetaTile label="Total rows" value={dataset.meta.rowCount.toLocaleString()} />
            <MetaTile label="Total columns" value={dataset.meta.colCount} />
            <MetaTile label="File size" value={formatBytes(dataset.meta.sizeBytes)} />
          </div>

          <div className="rise rise-4 mt-6 overflow-hidden rounded-2xl border border-ink-900/10 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-900/10 px-5 py-3.5">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">
                Preview — first 10 rows
              </h3>
              <button
                onClick={onContinue}
                className="rounded-lg bg-ink-900 px-4 py-1.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Analyze →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-900/10 bg-paper-deep">
                    {dataset.fields.map((f) => (
                      <th key={f} className="whitespace-nowrap px-4 py-2.5">
                        <span className="mr-2 font-mono text-xs font-semibold text-ink-900">{f}</span>
                        <TypeBadge type={typeByField[f]} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono text-[13px]">
                  {dataset.rows.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-ink-900/5 transition-colors hover:bg-signal-500/5">
                      {dataset.fields.map((f) => (
                        <td key={f} className="whitespace-nowrap px-4 py-2 text-ink-700">
                          {isEmpty(row[f]) ? (
                            <span className="rounded bg-red-100 px-1 text-[11px] text-red-500">null</span>
                          ) : (
                            String(row[f])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
