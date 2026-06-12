import { PageHeader, TypeBadge, ExportButton, NoData } from './shared.jsx'
import {
  qualityScore,
  qualityAction,
  datasetHealth,
  formatNum,
  isEmpty,
} from '../lib/analyze.js'
import { toCsv, downloadCsv } from '../lib/exportCsv.js'

function scoreTone(score) {
  if (score >= 90)
    return { dot: 'bg-emerald-500', text: 'text-emerald-600', label: 'Good' }
  if (score >= 70)
    return { dot: 'bg-amber-500', text: 'text-amber-600', label: 'Fair' }
  return { dot: 'bg-red-500', text: 'text-red-600', label: 'Poor' }
}

function HealthGauge({ health }) {
  const tone = scoreTone(health)
  const R = 52
  const C = 2 * Math.PI * R
  const color = health >= 90 ? '#10b981' : health >= 70 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="#ffffff22" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - health / 100)}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-mono text-3xl font-bold text-white">{health}</p>
          <p className={`font-mono text-[10px] uppercase tracking-widest ${tone.text}`}>
            {tone.label}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function QualityView({ dataset, columns, onLoadSample, goUpload }) {
  if (!dataset) return <NoData onLoadSample={onLoadSample} goUpload={goUpload} />

  const health = datasetHealth(columns)
  const totalNulls = columns.reduce((a, c) => a + c.nullCount, 0)
  const rowsWithNulls = dataset.rows.filter((r) =>
    dataset.fields.some((f) => isEmpty(r[f])),
  ).length

  function exportReport() {
    const rows = columns.map((c) => ({
      column: c.name,
      type: c.type,
      null_count: c.nullCount,
      null_pct: c.nullPct.toFixed(2),
      unique_values: c.uniqueCount,
      quality_score: qualityScore(c),
      recommended_action: qualityAction(c),
    }))
    downloadCsv('data_quality_report.csv', toCsv(Object.keys(rows[0]), rows))
  }

  function exportCleaned() {
    const cleaned = dataset.rows.filter(
      (r) => !dataset.fields.some((f) => isEmpty(r[f])),
    )
    downloadCsv(
      dataset.meta.filename.replace(/\.csv$/i, '') + '_cleaned.csv',
      toCsv(dataset.fields, cleaned),
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader kicker="Step 04 — Diagnosis" title="Data quality report">
        <div className="flex flex-wrap gap-3">
          <ExportButton onClick={exportReport}>Export report CSV</ExportButton>
          <ExportButton onClick={exportCleaned}>Export cleaned dataset</ExportButton>
        </div>
      </PageHeader>

      {/* Health banner */}
      <div className="rise rise-1 mb-6 flex flex-wrap items-center gap-8 rounded-2xl bg-ink-900 p-6 text-white sm:p-8">
        <HealthGauge health={health} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-500">
            Overall dataset health
          </p>
          <h2 className="mt-1 text-2xl font-extrabold">
            {health >= 90
              ? 'This dataset is in great shape.'
              : health >= 70
                ? 'Usable, but worth a cleanup pass.'
                : 'This dataset needs attention before analysis.'}
          </h2>
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm text-ink-300">
            <span>
              <strong className="text-white">{formatNum(totalNulls)}</strong> null cells total
            </span>
            <span>
              <strong className="text-white">{formatNum(rowsWithNulls)}</strong> rows with ≥1 null
              ({formatNum((rowsWithNulls / dataset.meta.rowCount) * 100, 1)}%)
            </span>
            <span>
              <strong className="text-white">
                {formatNum(dataset.meta.rowCount - rowsWithNulls)}
              </strong>{' '}
              rows in cleaned export
            </span>
          </div>
        </div>
      </div>

      {/* Per-column table */}
      <div className="rise rise-2 overflow-hidden rounded-2xl border border-ink-900/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-900/10 bg-paper-deep font-mono text-[11px] uppercase tracking-wider text-ink-700/60">
                <th className="px-4 py-3">Column</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Nulls</th>
                <th className="px-4 py-3 text-right">Null %</th>
                <th className="px-4 py-3 text-right">Unique</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3">Recommended action</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((c) => {
                const score = qualityScore(c)
                const tone = scoreTone(score)
                return (
                  <tr
                    key={c.name}
                    className="border-b border-ink-900/5 transition-colors last:border-0 hover:bg-signal-500/5"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[13px] font-semibold text-ink-900">
                      {c.name}
                    </td>
                    <td className="px-4 py-3">
                      <TypeBadge type={c.type} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[13px]">{c.nullCount}</td>
                    <td className="px-4 py-3 text-right font-mono text-[13px]">
                      {formatNum(c.nullPct, 1)}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[13px]">{c.uniqueCount}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center justify-end gap-1.5 font-mono text-[13px] font-bold ${tone.text}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                        {score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-700/75">{qualityAction(c)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-ink-700/50">
        Score = 100 − 2 × null% (minus a penalty for constant columns). Green ≥ 90 · Yellow ≥ 70 ·
        Red &lt; 70. The cleaned export removes every row containing at least one null/empty cell.
      </p>
    </div>
  )
}
