// Core analysis engine: column type inference, per-column statistics,
// and data quality scoring for a parsed CSV (array of row objects).

const DATE_RE =
  /^(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})([ T]\d{1,2}:\d{2}(:\d{2})?)?$/

export function isEmpty(v) {
  return v === null || v === undefined || String(v).trim() === ''
}

function asNumber(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN
  const s = String(v).trim().replace(/,/g, '')
  if (s === '' || /[a-z]/i.test(s)) return NaN
  return Number(s)
}

function asDate(v) {
  const s = String(v).trim()
  if (!DATE_RE.test(s)) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

// Infer a column's type from its non-empty values: numeric, date, or text.
export function inferType(values) {
  const sample = values.filter((v) => !isEmpty(v))
  if (sample.length === 0) return 'text'
  let numeric = 0
  let date = 0
  for (const v of sample) {
    if (!Number.isNaN(asNumber(v))) numeric++
    else if (asDate(v)) date++
  }
  if (numeric / sample.length >= 0.9) return 'numeric'
  if (date / sample.length >= 0.9) return 'date'
  return 'text'
}

function numericStats(nums) {
  const sorted = [...nums].sort((a, b) => a - b)
  const n = sorted.length
  if (n === 0) return null
  const sum = sorted.reduce((a, b) => a + b, 0)
  const mean = sum / n
  const median =
    n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2
  const variance = sorted.reduce((a, v) => a + (v - mean) ** 2, 0) / n
  return {
    min: sorted[0],
    max: sorted[n - 1],
    mean,
    median,
    std: Math.sqrt(variance),
  }
}

function frequencies(values) {
  const map = new Map()
  for (const v of values) {
    const key = String(v).trim()
    map.set(key, (map.get(key) || 0) + 1)
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}

// Analyze every column of the dataset. Returns array of column reports.
export function analyzeColumns(rows, fields) {
  return fields.map((name) => {
    const raw = rows.map((r) => r[name])
    const nonEmpty = raw.filter((v) => !isEmpty(v))
    const nullCount = raw.length - nonEmpty.length
    const nullPct = raw.length ? (nullCount / raw.length) * 100 : 0
    const type = inferType(raw)
    const freq = frequencies(nonEmpty)

    const col = {
      name,
      type,
      total: raw.length,
      nullCount,
      nullPct,
      uniqueCount: freq.length,
      topValues: freq.slice(0, 10).map(([value, count]) => ({ value, count })),
      mostFrequent: freq[0] ? { value: freq[0][0], count: freq[0][1] } : null,
    }

    if (type === 'numeric') {
      const nums = nonEmpty.map(asNumber).filter((n) => !Number.isNaN(n))
      col.stats = numericStats(nums)
      col.values = nums
    }
    if (type === 'date') {
      const dates = nonEmpty.map(asDate).filter(Boolean)
      col.dateRange = dates.length
        ? {
            min: new Date(Math.min(...dates)),
            max: new Date(Math.max(...dates)),
          }
        : null
    }
    return col
  })
}

// Histogram bins for a numeric column (Sturges' rule, capped at 12 bins).
export function histogram(values, maxBins = 12) {
  if (!values || values.length === 0) return []
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (min === max) return [{ label: formatNum(min), count: values.length }]
  const bins = Math.min(maxBins, Math.max(4, Math.ceil(Math.log2(values.length) + 1)))
  const width = (max - min) / bins
  const counts = Array.from({ length: bins }, () => 0)
  for (const v of values) {
    const idx = Math.min(bins - 1, Math.floor((v - min) / width))
    counts[idx]++
  }
  return counts.map((count, i) => ({
    label: `${formatNum(min + i * width)}–${formatNum(min + (i + 1) * width)}`,
    count,
  }))
}

// Time series: average of a numeric column grouped by a date column (by day).
export function timeSeries(rows, dateField, numField) {
  const map = new Map()
  for (const r of rows) {
    const d = asDate(r[dateField])
    const n = asNumber(r[numField])
    if (!d || Number.isNaN(n)) continue
    const key = d.toISOString().slice(0, 10)
    if (!map.has(key)) map.set(key, { sum: 0, count: 0 })
    const e = map.get(key)
    e.sum += n
    e.count++
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, { sum, count }]) => ({ date, value: sum / count }))
}

// Quality score per column (0–100): penalize nulls heavily, flag constant
// columns and near-unique text columns (likely identifiers).
export function qualityScore(col) {
  let score = 100 - col.nullPct * 2
  if (col.uniqueCount === 1 && col.total > 1) score -= 25
  return Math.max(0, Math.min(100, Math.round(score)))
}

export function qualityAction(col) {
  if (col.nullPct === 0 && col.uniqueCount > 1) return 'No action needed'
  if (col.nullPct > 20) return 'High null rate — investigate source or drop column'
  if (col.nullPct > 0 && col.type === 'numeric')
    return 'Impute missing values (mean/median) or remove rows'
  if (col.nullPct > 0) return 'Fill missing values or remove affected rows'
  if (col.uniqueCount === 1) return 'Constant column — consider removing'
  return 'No action needed'
}

export function datasetHealth(columns) {
  if (columns.length === 0) return 0
  const avg = columns.reduce((a, c) => a + qualityScore(c), 0) / columns.length
  return Math.round(avg)
}

export function formatNum(n, digits = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toLocaleString('en-US')
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })
}
