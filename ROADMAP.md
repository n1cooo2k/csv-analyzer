# Roadmap

Planned improvements, roughly ordered by effort/value. Checkboxes track progress.

## Week 1 — Polish & quick wins

- [ ] Add real screenshots to the README (Upload, Summary, Visualizations, Quality)
- [ ] Open Graph / social meta tags so the Vercel link previews nicely when shared
- [ ] Lazy-load the Visualizations view (`React.lazy`) so Recharts is code-split — fixes the 600 kB chunk warning and speeds up first load
- [ ] Keep the selected column when navigating away from Visualizations and back (lift state to `App`)
- [ ] Dark mode toggle (the ink palette already exists; invert the work surface)

## Week 2 — Analysis depth

- [ ] Row filtering: filter by column value (e.g. only `priority = P1`) and re-run all stats/charts on the filtered subset
- [ ] Outlier detection for numeric columns (IQR or z-score) surfaced in the Quality Report
- [ ] Duplicate-row detection with count and an "export without duplicates" option
- [ ] Correlation matrix between numeric columns (heatmap)
- [ ] Column drill-down: click a summary card to see full frequency table and percentiles

## Week 3 — Data handling & robustness

- [ ] Web Worker parsing (`PapaParse worker: true`) + streaming so 100 MB+ files don't freeze the UI
- [ ] Smarter cleaning options: impute mean/median/mode per column instead of only dropping rows
- [ ] Excel support (`.xlsx`) via SheetJS, with sheet picker
- [ ] Persist the last dataset in IndexedDB so a page refresh doesn't lose work
- [ ] Spanish/English language toggle

## Week 4+ — Bigger bets

- [ ] Export a full self-contained HTML/PDF report (stats + charts + quality) to attach to tickets or email
- [ ] Compare two CSVs side by side (schema diff + stat deltas) — useful for before/after cleanup
- [ ] Saved "analysis presets" for recurring file layouts (e.g. weekly incident exports from Remedy/Helix)
- [ ] Unit tests for `src/lib/analyze.js` with Vitest + GitHub Actions CI on every push
- [ ] PWA manifest + offline support (the app is already fully client-side)
