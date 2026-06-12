# CSV Data Analyzer

**Live demo:** [csv-analyzer-ten.vercel.app](https://csv-analyzer-ten.vercel.app) — click "Load sample dataset" to try it without a file.

A client-side CSV analysis dashboard. Drop in any CSV file and instantly get column statistics, auto-generated charts, and a color-coded data quality report — all processed locally in the browser. No backend, no data ever leaves your machine.

## Features

- **Upload & parsing** — drag-and-drop or click-to-upload, powered by PapaParse with automatic column type detection (numeric / text / date), 10-row preview and file metadata.
- **Statistical summary** — per-column cards: min / max / mean / median / std deviation for numeric columns, unique count and most frequent value for text columns, null counts for everything.
- **Visualizations** — top-10 bar chart for categorical columns, histogram for numeric columns, time-series line chart when a date column is detected, and a null-vs-filled donut for any column. Selectable via dropdown.
- **Data quality report** — per-column quality score (green / yellow / red), recommended actions, and an overall dataset health gauge (0–100).
- **Exports** — statistical summary, quality report, and a cleaned dataset (rows with nulls removed) as CSV.
- **Built-in sample dataset** — 80 fictional IT operations incidents so the app can be demoed without uploading anything.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | [React 18](https://react.dev) + [Vite 6](https://vitejs.dev) | Fast dev server, instant HMR, tiny production build |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) | Utility-first styling with a custom design-token theme |
| Charts | [Recharts](https://recharts.org) | Declarative, responsive SVG charts |
| CSV parsing | [PapaParse](https://www.papaparse.com) | Battle-tested in-browser CSV parser with header detection |

There is intentionally **no backend** — analysis runs entirely client-side, which makes the app free to host, private by default, and trivially deployable as a static site.

## Setup & run

Requires Node.js 18+.

```bash
git clone <your-repo-url>
cd csv-analyzer
npm install
npm run dev        # dev server at http://localhost:5173
```

Production build:

```bash
npm run build      # outputs static site to dist/
npm run preview    # serve the production build locally
```

## Deploy on Vercel

**Option A — Git integration (recommended)**

1. Push this folder to a GitHub/GitLab repository.
2. In [Vercel](https://vercel.com/new), click **Add New → Project** and import the repo.
3. Vercel auto-detects Vite. Defaults are correct: build command `npm run build`, output directory `dist`.
4. Click **Deploy**. Every push to `main` redeploys automatically.

**Option B — Vercel CLI**

```bash
npm i -g vercel
vercel           # preview deployment
vercel --prod    # production deployment
```

No environment variables or `vercel.json` are needed — the app is a single-page static site.

## Project structure

```
src/
├── App.jsx                  # State, navigation, CSV parsing entry point
├── lib/
│   ├── analyze.js           # Type inference, statistics, histograms, quality scoring
│   ├── sample.js            # Built-in IT incidents sample dataset (deterministic)
│   └── exportCsv.js         # CSV serialization + browser download
└── components/
    ├── Sidebar.jsx          # Dark sidebar navigation (responsive)
    ├── UploadView.jsx       # Dropzone, metadata tiles, preview table
    ├── SummaryView.jsx      # Per-column statistic cards
    ├── ChartsView.jsx       # Recharts visualizations + column selector
    ├── QualityView.jsx      # Health gauge, quality table, exports
    └── shared.jsx           # PageHeader, badges, buttons, empty states
```

## Screenshots

<!-- Add screenshots here -->

| Upload | Summary |
|---|---|
| _screenshot placeholder_ | _screenshot placeholder_ |

| Visualizations | Quality report |
|---|---|
| _screenshot placeholder_ | _screenshot placeholder_ |
