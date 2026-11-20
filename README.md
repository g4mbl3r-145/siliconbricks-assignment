# Plot to concept · Bangkok

**Live:** https://siliconbricks-assignment.vercel.app (opens with a sample plot on Soi Sukhumvit 39)

Draw a plot anywhere in Bangkok, mark the road it faces, pick a building type. The tool shows the rules that apply, the space the building may fill, and three concept designs that fit, each with a pass / check / fail checklist and a floor-by-floor area statement. Everything sits in 3D among the real surrounding buildings and updates live.

Scope: zone **ย.10** (high-density residential, Bangkok Comprehensive Plan B.E. 2556) is modelled in full. Elsewhere in Bangkok, FAR and OSR are read from the official zoning layer, but the zone's use conditions are not checked (the UI says so).

## Using it

| Action | How |
|---|---|
| Reshape the plot | Drag a corner; click a white mid-point to add one; right-click or double-click a corner to remove it |
| New plot | "Draw new plot", click corners, click the first corner or press Enter |
| From Google Earth Pro | Draw with Add Polygon → Save Place As… KML/KMZ → "Import KML / KMZ". "Export KML" goes the other way |
| Road frontage | Detected from OSM; click any plot edge to toggle it. Enter the surveyed right-of-way width |
| See what a rule does | Untick it under "Zone and rules": the allowed space redraws without it, the checklist still tests it |
| Inspect a floor | Level picker on the map; the plan inset follows |
| Share | "Copy share link": the whole state is in the URL hash |

## How the allowed space is worked out

All geometry is in local metres (tangent-plane projection about the plot centre, < 0.01 % error at plot scale), in pure functions under `starter/src/lib/`, unit-tested.

1. **Per-edge setbacks.** Each plot edge is a road edge or a side/rear edge. Side/rear edges are cut with a band of the required width around the segment; road edges with a band around the edge's infinite line (the law measures to the road, which continues past the corners). Concave plots work; the largest remaining piece is kept.
2. **Road setback**, MR 55 ข้อ 41: by road width (< 6 m, < 10 m from the centreline; 10–20 m: 1/10 of the width; > 20 m: 2 m).
3. **Side and rear**, MR 55 ข้อ 50: 2 m up to 9 m, 3 m below 23 m. For a high-rise (≥ 23 m) 6 m, read from MR 33 ข้อ 3's 6 m fire-access road round the building (labelled *interpretation*).
4. **Height vs road**, MR 55 ข้อ 44: height at any point ≤ 2 × distance to the far side of the road. Applied per floor as a road-edge setback of max(ข้อ 41, h/2 − W), so the allowed space steps back as it rises.
5. **High-rise access**, MR 33 ข้อ 2: a high-rise or ≥ 10,000 m² needs a ≥ 10 m road and ≥ 12 m frontage (≥ 18 m road above 30,000 m²). If the road falls short, designs are capped below those thresholds and each design says what limits it.
6. **Area caps**: total floor area ≤ FAR × plot (plus the ข้อ 53 bonus if public open space is offered); open space ≥ OSR × floor area and ≥ 30 % of the largest floor (MR 55 ข้อ 33; 10 % for hotel and office).

Designs (tower on podium, twin towers, low-rise slab; twin low-rise blocks when the road is narrow) are stacks of floor polygons fitted inside that space. The number of parking floors is solved against the parking rule. Plates narrower than a minimum buildable width are dropped. Every number shown is computed from the geometry; floor areas sum to the total (tested).

## Where the data comes from

| Data | Source |
|---|---|
| Zone, FAR, OSR | BMA City Planning Dept ArcGIS layer `BMAGI_Planing/MapServer/1` (2556 plan). Sukhumvit extract bundled in `starter/public/zones.geojson`; live query elsewhere |
| Rule clauses | `references/BANGKOK.md`: each value with clause, URL and confidence. In the UI every rule carries a *sourced / secondary / interpretation / assumption* badge |
| Surrounding buildings, roads, stations | OpenStreetMap. Phrom Phong–Thong Lo snapshot bundled (`starter/public/context.json`, `scripts/fetch_context.py`); elsewhere read from the basemap's OpenMapTiles vector tiles, with Overpass tried in the background |
| Building heights | OSM `height`, else `building:levels` × 3.2 m, else estimated from footprint and drawn lighter. Only ~7 % of buildings in the snapshot have a mapped height |
| Basemap / imagery | OpenFreeMap (no key); satellite toggle: Esri World Imagery |

Decisions and the alternatives considered are logged in `DECISIONS.md`.

## Keeping it smooth

- The whole analysis runs in a Web Worker; only the newest input is computed, stale ones are dropped.
- MapLibre GeoJSON sources are updated only when their data changes.
- The 3D view is plain `fill-extrusion` layers: one renderer and one coordinate system for site, allowed space and designs.

## Run locally

```
cd starter
pnpm install
pnpm dev          # http://localhost:5173
pnpm vitest run   # unit tests
pnpm build
```

## Layout

```
starter/src/lib/geometry.ts   polygon ops: per-edge setbacks, clipping, fitting, distances
starter/src/lib/envelope.ts   allowed space floor by floor
starter/src/lib/designs.ts    design generators, checklist, area statement
starter/src/rules/bangkok.ts  every rule value with clause, source and basis
starter/src/lib/site.ts       zoning lookup, OSM context, road detection
starter/src/components/       MapView (MapLibre), PlanView (SVG plan)
references/BANGKOK.md         rule research with citations
DECISIONS.md                  calls made where the brief or law was unclear
```

## Known limits

- One road width per plot; a corner plot uses the wider road (MR 55 ข้อ 46). Planned road widening lines are not modelled.
- Unverified gaps in the law research (consolidated MR 55 after MR 61 and MR 68, FAR exemptions, Bangkok-only setbacks) are listed in `references/BANGKOK.md`.
- Aviation height limits, EIA detail and soil or flood rules are out of scope.
- Concept-stage estimate, not a permit check.

The Vite + React starter in `starter/` was prepared before the clock started and reworked for this brief (see git history).
