# Submission: Founding Team Engineer, Generalist

## 1. Live link

https://siliconbricks-assignment.vercel.app

Opens on a sample plot at Soi Sukhumvit 39 in Phrom Phong. Tip: click any edge of the plot to toggle whether it faces a road.

## 2. Repo

https://github.com/g4mbl3r-145/siliconbricks-assignment

Rules sit in `starter/src/rules/bangkok.ts`; run `cd starter && pnpm vitest run` for the 21 unit tests.

## 3. One-pager

### 3.1 What I understood

A developer looking at a Bangkok plot before hiring an architect wants straight answers: how much floor area can I legally build, how tall can it go, and what rough massing fits. Rules are split across the Bangkok Comprehensive Plan B.E. 2556 and Building Control Act ministerial regulations in Thai, while the 4th revision draft is not enacted yet (public comment ended Nov 9, 2026; likely late 2027) and GIS/OSM data has gaps. "Done" means drawing or importing the plot, seeing real context in 3D, getting live updates, and tracing every number to a clause or assumption.

### 3.2 What I did, and why

I picked Zone Y.10 (high-density residential around Sukhumvit / Phrom Phong to Thong Lo) under B.E. 2556 because it is the active plan and a solid high-density test case (FAR 8:1, OSR at least 4%, at least 50% planted open space, plus a Clause 53 bonus up to +20% / at most 5x public open space). I modelled condominiums in full first, then added hotel and office using partial rules plus labelled assumptions. The flow: draw or import/export KML/KMZ, detect zone and road, inspect or toggle rules, see the floor-by-floor allowed envelope, and compare three massings (tower on podium, twin towers, low-rise slab; slab or twin low-rise when the road is narrow) with pass/check/fail checks and floor areas summing to the total.

Key calls: narrow-road fallback (show high-rise as failing while offering low-rise or twin low-rise when road or frontage misses MR 33 Clause 2: under 10 m road, under 12 m frontage, or under 18 m road above 30,000 m²); 6 m high-rise side setback taken from MR 33 Clause 3 fire-access and badged as an interpretation; and showing estimates as estimates (OSM has ~7% building heights/levels and ~0.3% road widths, so missing heights use 9 / 13 / 20 m estimates drawn lighter and road widths use editable class defaults). Pre-clock Indian bye-law files (`references/BYELAWS.md` and old starter files from `e65dde0`) were left unused, the three.js viewer/sun/loader setup was dropped in `47d4438`, and Google Photorealistic 3D Tiles were not used.

### 3.3 Technical decisions, and why

**Stack:** Client-only Vite + React 19 + TypeScript with MapLibre GL fill-extrusion on OpenFreeMap (plus Esri World Imagery toggle), `polygon-clipping`, and `fflate`. No backend or API keys are needed, and plot, allowed envelope, massings, and context share one coordinate system and renderer instead of mixing in a separate three.js view.

**Allowed space (`envelope.ts`, `geometry.ts`):** Local metres projected around the plot centre. Side and rear setbacks clip per edge. MR 55 Clause 44 (height at most 2x distance to far side of road) steps back floor by floor via `max(Clause 41 setback, (floor top + roof allowance)/2 - road width)` measured to the road edge's infinite line, splitting low-rise (< 23 m, Clause 50) from high-rise (>= 23 m, 6 m side rule until < 30 m² remains).

**Site data (`site.ts`):** BMA ArcGIS layer (`BMAGI_Planing/MapServer/1`, `LUP_ZONE` / `LUP_FAR` / `LUP_OSR`) with a bundled Sukhumvit extract and live point query elsewhere. OSM buildings and roads are bundled for Phrom Phong (`public/context.json`, ~4,559 buildings, 1,166 roads); outside the bundled area, surroundings come from the basemap's vector tiles, with Overpass only tried in the background.

**Smoothness:** Web Worker (`analyse.worker.ts`) dropping stale inputs, MapLibre source updates only on change, and the bundled Phrom Phong snapshot avoiding live Overpass delays.

### 3.4 What's still wrong, and what I'd do next

- **Road width and full route:** ~0.3% OSM width coverage, and Thai court ruling A.588/2557 looks at right-of-way along the route to a qualifying road. Fix: add cadastral or BMA ROW data and route checks.
- **Building heights:** ~93% of snapshot heights are estimated. Fix: use higher-accuracy height data (like Overture or photogrammetry) and keep estimated vs. surveyed clear.
- **6 m setback, FAR and MR 55 updates:** 6 m side rule is an interpretation, parking sits inside FAR conservatively, and post-MR 61 / MR 68 MR 55 changes need full verification. Fix: verify consolidated rules and exemptions directly.
- **Corner plots, split envelopes and planted check:** Corner plots take the widest road rather than full Clauses 45/46 rules, disjoint clipped envelopes keep only the largest polygon, and planted area stays "check". Fix: model multi-road edge rules, multi-polygon envelopes, and planted sub-zones.
- **Scope and live Overpass:** No cost range, unit mix, or sun study yet; background Overpass outside the snapshot can be slow or fail (nudging retries). Fix: add cost, unit, and shadow modules after hardening zoning.

## 4. Transcripts

In the early research and planning sessions, the main catch was separating what is actually in force from what looks plausible on paper: keeping the zoning engine anchored to Bangkok Comprehensive Plan B.E. 2556 rather than the un-enacted 4th revision draft, and checking how sparse real OSM width and height/levels tags were before trusting auto-detected site values. Any specific bug fixes in the build were checked against the Thai clauses, geometry behavior, and tests. Note: a colleague's name and employer details were redacted from the transcripts.

Raw transcripts (in order):

- Session 1, connecting to the MCP server and setup (`50971ef9-4d3a-4645-98dc-667d5c416655`): https://github.com/g4mbl3r-145/siliconbricks-assignment/blob/main/transcripts/session-1-50971ef9.jsonl
- Session 2, where the assignment was started, then research, planning and build (`12629d5f-1382-4f76-a2ef-58a07eda1f66`): https://github.com/g4mbl3r-145/siliconbricks-assignment/blob/main/transcripts/session-2-12629d5f.jsonl
- Session 3 (`1ddfc9cf-2c1a-4c9b-acfc-1e4bb035e80b`): https://github.com/g4mbl3r-145/siliconbricks-assignment/blob/main/transcripts/session-3-1ddfc9cf.jsonl

## 5. Your setup

1. **Tools, models, and agents:** Claude Code for codebase work, research, and iteration.
2. **How I run them:** Repo/project instructions (`CLAUDE.md`), decision logs (`DECISIONS.md`), small testable modules, `vitest`, and browser/UI checks.
3. **Monthly tokens or spend:** `[replace with your exact Claude/API monthly spend from your billing page, e.g. $20/mo on Claude Pro]`
4. **Most ambitious AI-built project:** https://github.com/g4mbl3r-145/Stock-Analyzer (alongside a clinical-trial SaaS platform and a superforecasting pipeline built during internships) — Where the AI broke: it tended to gloss over financial edge cases, caching invalidation, and multi-file state drift unless I locked down explicit validation checks, tests, and module boundaries first.
5. **Ramping up on a new domain:** Read primary rules and official GIS/data layers first, log trade-offs in `DECISIONS.md`, and verify with unit tests and visual checks.
6. **3D / vision / diffusion / local models:** Built an explainable chest X-ray report generation pipeline (Rad-DINO, BioClinicalBERT, and LoRA-tuned Mistral-7B with gated cross-attention) and worked on 2D/3D web map extrusions; haven't done hands-on production work with diffusion or local weight training.

## 6. Best project

https://github.com/g4mbl3r-145/Stock-Analyzer

I built this stock analyser app on my own during college, handling the full setup from architecture and data fetching to analysis logic and the frontend UI. Instead of just slapping a chart on raw prices, I put real analysis logic into it and wired up everything end to end myself so I could test and iterate on how stocks behave and get evaluated.

## 7. About you

Aman Agrawal - final-year ECE student at IIT Roorkee (2023 to 2027), full-stack and AI engineer, and competitive programmer (Codeforces Expert, max rating 1703). I like turning messy real-world rules into clean, testable software with clear trade-offs.

- Resume: https://drive.google.com/file/d/1bq7iC-QlwkypCW2Yf_PHFXo2VZfP8-FD/view?usp=sharing
- LinkedIn: https://linkedin.com/in/aman-agrawal-a121a6293
- GitHub: https://github.com/g4mbl3r-145