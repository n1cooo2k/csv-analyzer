import { useMemo, useState } from 'react'
import Papa from 'papaparse'
import Sidebar from './components/Sidebar.jsx'
import UploadView from './components/UploadView.jsx'
import SummaryView from './components/SummaryView.jsx'
import ChartsView from './components/ChartsView.jsx'
import QualityView from './components/QualityView.jsx'
import { analyzeColumns } from './lib/analyze.js'
import { sampleDataset } from './lib/sample.js'

export default function App() {
  const [view, setView] = useState('upload')
  const [dataset, setDataset] = useState(null)
  const [error, setError] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const columns = useMemo(
    () => (dataset ? analyzeColumns(dataset.rows, dataset.fields) : []),
    [dataset],
  )

  function handleFile(file) {
    setError(null)
    if (!file) return
    if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') {
      setError(`"${file.name}" does not look like a CSV file.`)
      return
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        const fields = (results.meta.fields || []).filter((f) => f !== '')
        if (!fields.length || !results.data.length) {
          setError('Could not find any data in that file. Is it a valid CSV with a header row?')
          return
        }
        setDataset({
          rows: results.data,
          fields,
          meta: {
            filename: file.name,
            rowCount: results.data.length,
            colCount: fields.length,
            sizeBytes: file.size,
          },
        })
      },
      error: (err) => setError(`Parse error: ${err.message}`),
    })
  }

  function loadSample() {
    setError(null)
    setDataset(sampleDataset())
  }

  function reset() {
    setDataset(null)
    setError(null)
    setView('upload')
  }

  function navigate(v) {
    setView(v)
    setMenuOpen(false)
  }

  const viewProps = { dataset, columns }

  return (
    <div className="grain min-h-screen bg-paper text-ink-900 lg:flex">
      <Sidebar
        view={view}
        onNavigate={navigate}
        hasData={!!dataset}
        meta={dataset?.meta}
        onReset={reset}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
      <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
        {view === 'upload' && (
          <UploadView
            {...viewProps}
            error={error}
            onFile={handleFile}
            onLoadSample={loadSample}
            onContinue={() => setView('summary')}
          />
        )}
        {view === 'summary' && <SummaryView {...viewProps} onLoadSample={loadSample} goUpload={() => setView('upload')} />}
        {view === 'charts' && <ChartsView {...viewProps} onLoadSample={loadSample} goUpload={() => setView('upload')} />}
        {view === 'quality' && <QualityView {...viewProps} onLoadSample={loadSample} goUpload={() => setView('upload')} />}
      </main>
    </div>
  )
}
