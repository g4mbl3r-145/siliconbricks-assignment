# Plot feasibility starter

Browser tool: draw or trace a plot, set per-edge setbacks and rules, get massing options in 2D and 3D with an area statement, rule checks, and sun and shadow at any hour. State lives in the URL, so a link reproduces the view.

## Run

```powershell
..\.venv\Scripts\Activate.ps1
pnpm install
pnpm dev        # http://localhost:5173
pnpm vitest run # unit tests
pnpm build      # type-check and build to dist/
```

## Layout

| Path | What |
|---|---|
| `src/lib/geometry.ts` | Area, centroid, per-edge setback inset (concave-safe), clipping |
| `src/lib/massing.ts` | Options, floors from FAR / coverage / height, rule checks with pass / check / fail |
| `src/lib/sun.ts` | Sun direction for date, latitude, longitude |
| `src/lib/loaders.ts` | PDF page or image as tracing underlay, DXF lines and polylines (loaded on demand) |
| `src/components/PlanView.tsx` | SVG plan: plot, setback line, footprint, edge picking, tracing |
| `src/components/Viewer.tsx` | three.js view: floors, level isolation, sun shadows |

## Known limits

- Rule values in the UI are example inputs, not from any bye-law. Sourced numbers are in `../references/BYELAWS.md`.
- Setback distance is measured to each boundary segment, so reflex corners get rounded cuts.
- Every floor uses the full footprint; FAR exemptions are not modelled.
- PDF underlay needs a manual metres-per-pixel scale.
