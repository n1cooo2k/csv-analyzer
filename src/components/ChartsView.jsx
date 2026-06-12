import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { PageHeader, TypeBadge, NoData } from './shared.jsx'
import { histogram, timeSeries, formatNum } from '../lib/analyze.js'

const INK = '#0c1424'
const SIGNAL = '#f59e0b'
const TEAL = '#14b8a6'
const RED = '#ef4444'

const tooltipStyle = {
  background: INK,
  border: 'none',
  borderRadius: 8,
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: 12,
  color: '#fff',
}

function ChartCard({ title, subtitle, children, delay = 0 }) {
  return (
    <section
      className="rise rounded-2xl border border-ink-900/10 bg-white p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">{title}</h3>
      <p className="mb-4 mt-0.5 text-xs text-ink-700/55">{subtitle}</p>
      <div className="h-72">{children}</div>
    </section>
  )
}

function truncate(s, n = 14) {
  s = String(s)
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

export default function ChartsView({ dataset, columns, onLoadSample, goUpload }) {
  const [selectedName, setSelectedName] = useState(null)

  const selected =
    columns.find((c) => c.name === selectedName) ?? columns[0] ?? null

  const dateCol = useMemo(() => columns.find((c) => c.type === 'date'), [columns])
  const numericCols = useMemo(
    () => columns.filter((c) => c.type === 'numeric'),
    [columns],
  )
  // For the time series, prefer the selected column if numeric.
  const tsNumeric = selected?.type === 'numeric' ? selected : numericCols[0]

  const tsData = useMemo(
    () =>
      dataset && dateCol && tsNumeric
        ? timeSeries(dataset.rows, dateCol.name, tsNumeric.name)
        : [],
    [dataset, dateCol, tsNumeric],
  )

  if (!dataset) return <NoData onLoadSample={onLoadSample} goUpload={goUpload} />
  if (!selected) return null

  const nullData = [
    { name: 'Filled', value: selected.total - selected.nullCount },
    { name: 'Null / empty', value: selected.nullCount },
  ]

  const histData = selected.type === 'numeric' ? histogram(selected.values) : []

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader kicker="Step 03 — Visual" title="Visualizations">
        <label className="flex items-center gap-3 rounded-xl border border-ink-900/15 bg-white px-4 py-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-700/50">
            Column
          </span>
          <select
            value={selected.name}
            onChange={(e) => setSelectedName(e.target.value)}
            className="cursor-pointer bg-transparent font-mono text-sm font-semibold text-ink-900 outline-none"
          >
            {columns.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
          <TypeBadge type={selected.type} />
        </label>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        {(selected.type === 'text' || selected.type === 'date') && (
          <ChartCard
            title="Top values"
            subtitle={`10 most frequent values in "${selected.name}"`}
          >
            <ResponsiveContainer>
              <BarChart
                data={selected.topValues}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid horizontal={false} stroke="#0c142414" />
                <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                <YAxis
                  type="category"
                  dataKey="value"
                  width={110}
                  tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }}
                  tickFormatter={(v) => truncate(v)}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f59e0b14' }} />
                <Bar dataKey="count" fill={SIGNAL} radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {selected.type === 'numeric' && (
          <ChartCard
            title="Histogram"
            subtitle={`Value distribution of "${selected.name}" (${formatNum(selected.values.length)} values)`}
          >
            <ResponsiveContainer>
              <BarChart data={histData} margin={{ left: -10, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#0c142414" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono' }}
                  angle={-30}
                  textAnchor="end"
                  height={55}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#14b8a614' }} />
                <Bar dataKey="count" fill={TEAL} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        <ChartCard
          title="Completeness"
          subtitle={`Null vs non-null share in "${selected.name}"`}
          delay={80}
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={nullData}
                dataKey="value"
                nameKey="name"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={3}
                label={({ name, value, percent }) =>
                  `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                }
              >
                <Cell fill={INK} />
                <Cell fill={selected.nullCount > 0 ? RED : '#d1cfc4'} />
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {dateCol && tsNumeric && tsData.length > 1 && (
          <ChartCard
            title="Trend over time"
            subtitle={`Daily average of "${tsNumeric.name}" by "${dateCol.name}"`}
            delay={160}
          >
            <ResponsiveContainer>
              <LineChart data={tsData} margin={{ left: -10, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#0c142414" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                  minTickGap={28}
                />
                <YAxis tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={SIGNAL}
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: INK, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: SIGNAL }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {!dateCol && (
        <p className="mt-4 rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-xs text-ink-700/60">
          ℹ No date column detected — the time-series chart appears automatically when your CSV
          contains a date column alongside numeric data.
        </p>
      )}
    </div>
  )
}
