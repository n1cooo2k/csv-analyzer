// CSV export helpers: build CSV text from rows and trigger a browser download.

function escapeCell(v) {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(fields, rows) {
  const header = fields.map(escapeCell).join(',')
  const body = rows
    .map((r) => fields.map((f) => escapeCell(r[f])).join(','))
    .join('\n')
  return header + '\n' + body
}

export function downloadCsv(filename, csvText) {
  const blob = new Blob(['﻿' + csvText], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
