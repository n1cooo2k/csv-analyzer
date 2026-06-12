import { PageHeader, TypeBadge, ExportButton, NoData } from './shared.jsx'
import { formatNum } from '../lib/analyze.js'
import { toCsv, downloadCsv } from '../lib/exportCsv.js'

function StatRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-ink-900/10 py-1.5 last:border-0">
      <span className="text-xs text-ink-700/60">{label}</span>
      <span className="truncate font-mono text-[13px] font-semibold text-ink-900" title={String(value)}>
        {value}
      </span>
    </div>
  )
}

function ColumnCard({ col, index }) {
  const nullTone =
    col.nullPct === 0
      ? 'text-emerald-600'
      : col.nullPct <= 10
        ? 'text-amber-600'
        : 'text-red-600'

  return (
    <article
      className="rise rounded-2xl border border-ink-900/10 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_30px_-12px_rgb(12_20_36/0.25)]"
      style={{ animationDelay: `${Math.min(index * 60, 480)}ms` }}
    >
      <header className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[10px] text-ink-700/40">COL {String(index + 1).padStart(2, '0')}</p>
          <h3 className="truncate font-mono text-sm font-bold text-ink-900" title={col.name}>
            {col.name}
          </h3>
        </div>
        <TypeBadge type={col.type} />
      </header>

      {col.type === 'numeric' && col.stats && (
        <>
          <StatRow label="Min" value={formatNum(col.stats.min)} />
          <StatRow label="Max" value={formatNum(col.stats.max)} />
          <StatRow label="Mean" value={formatNum(col.stats.mean)} />
          <StatRow label="Median" value={formatNum(col.stats.median)} />
          <StatRow label="Std deviation" value={formatNum(col.stats.std)} />
        </>
      )}

      {col.type === 'text' && (
        <>
          <StatRow label="Unique values" value={formatNum(col.uniqueCount)} />
          <StatRow
            label="Most frequent"
            value={col.mostFrequent ? col.mostFrequent.value : '—'}
          />
          <StatRow
            label="Frequency"
            value={col.mostFrequent ? `${col.mostFrequent.count}×` : '—'}
          />
        </>
      )}

      {col.type === 'date' && (
        <>
          <StatRow label="Unique dates" value={formatNum(col.uniqueCount)} />
          <StatRow
            label="Earliest"
            value={col.dateRange ? col.dateRange.min.toISOString().slice(0, 10) : '—'}
          />
          <StatRow
            label="Latest"
            value={col.dateRange ? col.dateRange.max.toISOString().slice(0, 10) : '—'}
          />
        </>
      )}

      <div className="mt-3 rounded-lg bg-paper-deep px-3 py-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-ink-700/60">Null / empty</span>
          <span className={`font-mono text-[13px] font-bold ${nullTone}`}>
            {col.nullCount} ({formatNum(col.nullPct, 1)}%)
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-900/10">
          <div
            className={`h-full rounded-full ${col.nullPct === 0 ? 'bg-emerald-500' : col.nullPct <= 10 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${Math.max(col.nullPct, col.nullPct > 0 ? 4 : 0)}%` }}
          />
        </div>
      </div>
    </article>
  )
}

export default function SummaryView({ dataset, columns, onLoadSample, goUpload }) {
  if (!dataset) return <NoData onLoadSample={onLoadSample} goUpload={goUpload} />

  function exportSummary() {
    const rows = columns.map((c) => ({
      column: c.name,
      type: c.type,
      total_values: c.total,
      null_count: c.nullCount,
      null_pct: c.nullPct.toFixed(2),
      unique_values: c.uniqueCount,
      most_frequent: c.mostFrequent?.value ?? '',
      most_frequent_count: c.mostFrequent?.count ?? '',
      min: c.stats ? c.stats.min : '',
      max: c.stats ? c.stats.max : '',
      mean: c.stats ? c.stats.mean.toFixed(4) : '',
      median: c.stats ? c.stats.median : '',
      std_dev: c.stats ? c.stats.std.toFixed(4) : '',
    }))
    downloadCsv(
      'statistical_summary.csv',
      toCsv(Object.keys(rows[0]), rows),
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader kicker="Step 02 — Statistics" title="Statistical summary">
        <ExportButton onClick={exportSummary}>Export summary CSV</ExportButton>
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {columns.map((col, i) => (
          <ColumnCard key={col.name} col={col} index={i} />
        ))}
      </div>
    </div>
  )
}
