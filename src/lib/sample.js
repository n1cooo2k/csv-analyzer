// Built-in sample dataset: fictional IT operations incident log.
// Deterministic pseudo-random generation so the demo is stable across loads.
// A few nulls are injected on purpose so the Quality Report has something to say.

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CATEGORIES = ['Batch Job Failure', 'Network', 'Database', 'Application', 'Hardware', 'Security']
const PRIORITIES = ['P1', 'P2', 'P3', 'P4']
const COUNTRIES = ['Mexico', 'USA', 'Spain', 'Brazil', 'Colombia', 'Argentina']
const STATUSES = ['Resolved', 'Closed', 'In Progress', 'Escalated']
const TEAMS = ['Mainframe Ops', 'Control-M Team', 'SAP Basis', 'Network Ops', 'DBA Team', 'Service Desk']

function pick(rnd, arr) {
  return arr[Math.floor(rnd() * arr.length)]
}

export function generateSampleRows(count = 80) {
  const rnd = mulberry32(20260611)
  const rows = []
  const start = new Date('2026-01-05T00:00:00Z').getTime()
  for (let i = 1; i <= count; i++) {
    const dayOffset = Math.floor(rnd() * 120)
    const date = new Date(start + dayOffset * 86400000).toISOString().slice(0, 10)
    const priority = pick(rnd, PRIORITIES)
    // Resolution time correlates loosely with priority for a realistic feel.
    const base = { P1: 2, P2: 6, P3: 18, P4: 36 }[priority]
    const resolution = Math.round((base + rnd() * base * 2.5) * 10) / 10
    rows.push({
      incident_id: `INC-${String(10000 + i)}`,
      date,
      category: pick(rnd, CATEGORIES),
      priority,
      country: rnd() < 0.04 ? '' : pick(rnd, COUNTRIES), // ~4% missing
      resolution_time_hours: rnd() < 0.07 ? '' : String(resolution), // ~7% missing
      status: pick(rnd, STATUSES),
      assigned_team: rnd() < 0.05 ? '' : pick(rnd, TEAMS), // ~5% missing
    })
  }
  return rows
}

export const SAMPLE_FIELDS = [
  'incident_id',
  'date',
  'category',
  'priority',
  'country',
  'resolution_time_hours',
  'status',
  'assigned_team',
]

export function sampleDataset() {
  const rows = generateSampleRows(80)
  const csv =
    SAMPLE_FIELDS.join(',') +
    '\n' +
    rows.map((r) => SAMPLE_FIELDS.map((f) => r[f]).join(',')).join('\n')
  return {
    rows,
    fields: SAMPLE_FIELDS,
    meta: {
      filename: 'sample_it_incidents.csv',
      rowCount: rows.length,
      colCount: SAMPLE_FIELDS.length,
      sizeBytes: new Blob([csv]).size,
    },
  }
}
