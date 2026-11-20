# Write-up guide: facts pack and outline

This file is for you to work from. It holds facts, numbers, where they come from, and an outline per section. It is not the write-up. Write every sentence of the submitted doc yourself (brief, section 6: "The write-up is yours to write. Your agent can submit it, not author it.").

Facts gathered 20 Nov 2026, ~09:50 IST, from the repo, `DECISIONS.md`, `references/BANGKOK.md` and a test run.

---

## A. How to write it

### Writing in your own voice
- Write a rough draft from memory first, with no files open. Then check it against this guide. What you remember is what you actually understood, and that's what they'll probe in the live call.
- Use first person: "I chose", "I got wrong", "I didn't have time to".
- Use your own vocabulary. If you wouldn't say a word out loud in the interview, don't write it.
- Don't copy phrasing from this file, `DECISIONS.md` or the code comments. Restate each fact the way you'd explain it to a friend.
- Be specific: numbers, clause names, file names. "Height ≤ 2 × distance to the far side of the road (MR 55 ข้อ 44)" beats "height rules".
- Keep it short. They grade "clear, specific reasons, in few words". One page for part 3 means one page.
- Be honest about weak spots. Section 4 of the one-pager is graded, and they will try to break the tool, so list the breaks before they find them.
- Use your real AI process. Say what the AI did, what you did, and where you overrode it. "Working with AI" is a graded criterion, so hiding AI use works against you.
- Read it aloud once. Cut every sentence that sounds like a brochure.

### Disclosures to make (recommended)
- `starter/` and `references/BYELAWS.md` (Indian MBBL notes) were prepared **before** the clock started. The pre-clock commit `e65dde0` shows this anyway, so say it first.
- Most of the pre-clock starter (Indian bye-laws, three.js viewer, sun shadows, PDF/DXF loaders) was **dropped** once the brief turned out to be about Bangkok. Commit `47d4438` removes `Viewer.tsx`, `massing.ts`, `loaders.ts` and `sun.ts`.

### Order of the doc (from the brief, mandatory)
1. Live link · 2. Repo · 3. One-pager · 4. Transcripts · 5. Your setup · 6. Best project · 7. About you

---

## B. Project facts

### Links and clock
| Item | Value |
|---|---|
| Live | https://siliconbricks-assignment.vercel.app (use this alias only; per-deploy URLs need a Vercel login) |
| Repo | https://github.com/g4mbl3r-145/siliconbricks-assignment (currently private; **make it public before submitting**) |
| Clock | Started 2026-11-19 19:22:57 UTC (20 Nov 00:52:57 IST). Deadline 2026-11-21 19:22:57 UTC (22 Nov 00:52:57 IST) |
| Commits so far | `e65dde0` pre-clock starter · `47d4438` Bangkok tool |
| Uncommitted | 7 files: 18 m road cap, frontage as a continuous run, minimum plate width, "limited by" line, live-road re-detect, faster Overpass. **Commit and deploy before writing about these.** |

### Scope chosen
- **Plan in force:** Bangkok Comprehensive Plan B.E. 2556 (2013). The 4th-revision draft isn't enacted: public posting ended 9 Nov 2026 and it's expected around late 2027 (D1).
- **Zone:** ย.10 (high-density residential, brown), Sukhumvit, Phrom Phong to Thong Lo (D2). FAR 8:1, OSR ≥ 4%, ≥ 50% of open space planted (Plan ข้อ 17). No condo size or road condition in ย.10.
- **Building types:** condo (fully sourced), hotel and office (partly sourced, with labelled assumptions) (D3, D19).

### What the tool does (feature list)
| Brief asks | What's built | Where in code |
|---|---|---|
| Any plot shape on a map | Draw a polygon on the map; import a KML/KMZ from Google Earth Pro; export KML; self-intersection check | `MapView.tsx`, `kml.ts`, `geometry.ts` |
| Location / zone | Zone looked up from the official BMA GIS layer (bundled extract, live query elsewhere) | `site.ts` `zoneAt` / `fetchZone` |
| Road it faces | Road edges auto-detected from OSM; click any edge to toggle it; width pre-filled from the OSM road class, labelled as an estimate, editable | `site.ts` `detectRoad`, D9 |
| Rules that apply | Panel of rules, each with value, clause, source link and basis (sourced / secondary / interpretation / assumption); each rule can be switched off | `rules/bangkok.ts`, `App.tsx` `Rule` |
| Allowed space | Stepped envelope, floor by floor, following the real plot outline | `envelope.ts` |
| Each rule visibly changes it | Switching a rule off rebuilds the envelope live | Flags in `bangkok.ts` |
| ≥ 2 designs with pass/fail | 3 designs: tower on podium, twin towers, low-rise slab; switches to slab / twin low-rise blocks when the road is too narrow for a high-rise (tower still shown, failing) | `designs.ts` |
| Floor areas add up | Area statement per floor (lobby / parking / main), GFA, FAR, net area, units, parking provided vs required; tested | `designs.ts`, tests |
| Real site in 3D | ~4,559 OSM buildings and 1,166 roads bundled around Phrom Phong (snapshot 2026-11-19 19:44 UTC); live Overpass outside it; buildings on the plot are removed; satellite toggle (Esri) | `site.ts`, `public/context.json`, D14–D16, D21 |
| Live, no reload | All analysis runs in a Web Worker; any change re-runs it | `analyse.worker.ts`, `useAnalysis.ts` |
| Shareable | Whole state encoded in the URL hash; "Copy share link" button | `App.tsx` `load` / `share` |
| Editable assumptions | Floor heights, roof allowance, efficiency, unit size, parking m²/space, plate size, minimum width, max storeys, FAR-bonus open space | `ASSUME_DEFAULT` in `bangkok.ts` |
| Units | m² plus Thai rai-ngan-wah | `site.ts` `rai` |

### Checklist items per design
FAR · OSR · open space ≥ 30% of largest floor (condo) / 10% (hotel, office) · planted share (always "check") · road setback (ข้อ 41) · height vs road plane (ข้อ 44) · side and rear setbacks (ข้อ 50 / MR 33 ข้อ 3) · high-rise road width and frontage (MR 33 ข้อ 2) · use permitted in ย.10 / size conditions · parking · EIA (condo).

Statuses are pass / check / fail, each with value, limit, clause and source link.

### Rules applied (numbers and sources)
| Rule | Value | Clause | Basis |
|---|---|---|---|
| FAR | 8 : 1 (bonus up to +20%, ≤ 5 × public open space) | Plan 2556 ข้อ 17, ข้อ 53 | sourced |
| OSR | ≥ 4% of floor area | ข้อ 17 | sourced |
| Open space, residential | ≥ 30% of largest floor | MR 55 ข้อ 33(1) | sourced |
| Open space, other | ≥ 10% | MR 55 ข้อ 33(2) | sourced (hotel use = interpretation) |
| Road setback | road < 10 m: 6 m from centreline (tall bldg); 10–20 m: w/10; > 20 m: 2 m | MR 55 ข้อ 41 | sourced |
| Height plane | h ≤ 2 × distance to far side of road | MR 55 ข้อ 44 | sourced |
| Side/rear < 23 m | 2 m (≤ 9 m) / 3 m (9–23 m) | MR 55 ข้อ 50 | sourced |
| Side/rear ≥ 23 m | 6 m | MR 33 ข้อ 3 fire-access road | **interpretation** (D6) |
| High-rise / extra-large | ≥ 23 m / ≥ 10,000 m² | MR 33 ข้อ 1 | sourced |
| Access | road ≥ 10 m (≥ 18 m if > 30,000 m²), frontage ≥ 12 m | MR 33 ข้อ 2 am. MR 50 | sourced |
| Parking, condo | max(1 per unit ≥ 60 m², 1 per 120 m²) | MR 7 + Ordinance 2544 | secondary |
| Parking, hotel/office | 1 per 120 m² | — | assumption |
| EIA | ≥ 80 units or ≥ 4,000 m² | MNRE notification | secondary |

Primary text links are in `references/BANGKOK.md`.

### How the allowed space is computed (for one-pager §3)
1. Project the plot from lat/lng to local metres (`project.ts`).
2. Cut the side/rear edges inward by the side setback (per-edge half-plane clipping with `polygon-clipping`, coordinates rounded).
3. For each floor (ground 4.5 m, typical 3.0 m for a condo), road-side distance = max(ข้อ 41 setback, (floor top + roof allowance)/2 − road width). That is ข้อ 44 rewritten as a setback that grows with height (D5).
4. Distances are measured to the road edge's **infinite line**, not the segment (D10, tested).
5. Two regimes: **low** (top + roof < 23 m, ข้อ 50 sides) and **high** (6 m sides, plane until < 30 m² is left).
6. Designs are stacked inside the envelope: podium fit to coverage, parking floors iterated to the smallest count that meets the requirement, tower plate fitted to target area, GFA capped at FAR × plot (and below 10,000 / 30,000 m² when access fails). Open space is re-checked and coverage shrunk up to 4 times.

### Stack and why (for §3)
- Vite + React 19 + TypeScript, client-only, no backend and no API keys.
- **MapLibre GL `fill-extrusion` on OpenFreeMap tiles** for all 3D: plot, envelope, designs and context share one coordinate system and one renderer; no key (D4). This replaced the pre-clock three.js viewer.
- `polygon-clipping` for offsets and intersections; `fflate` for KMZ.
- Web Worker so the UI doesn't freeze while the analysis runs.
- Vitest: **21 tests passing** (geometry, rule bands, envelope stepping, designs pass their own checks, narrow-road fallback, no-frontage fail, KML round-trip, plate width, curved frontage).
- Hosting: Vercel.

### Site data (for §3)
- Zoning: BMA official ArcGIS layer (`LUP_ZONE`, `LUP_FAR`, `LUP_OSR`), bundled extract plus live point query.
- Buildings and roads: OpenStreetMap. Bundled snapshot around Phrom Phong (bbox 100.560–100.582 E, 13.722–13.740 N) so the demo doesn't depend on a rate-limited API; live Overpass with 3 mirrors raced elsewhere (20–40 s).
- Heights: OSM `height`, else `building:levels` × 3.2 m, else estimated from footprint (9 / 13 / 20 m), drawn lighter. **Only ~7% of buildings carry a height or levels** (D15).
- Road width: **only ~0.3% of OSM roads in the sample carry `width`**, so it's pre-filled from road class and editable (D9).
- BTS stations from OSM for the ย.10 500 m station condition.

### Known gaps (for §4; check each is still true before you write it)
- Context heights are mostly estimates (~93%).
- Road width is an estimate until the user types it in; the law uses the full right-of-way along the whole route to a qualifying road (Supreme Admin. Court อ.588/2557). The tool can't verify that.
- 6 m high-rise side setback is an interpretation of MR 33 ข้อ 3.
- Parking counted in FAR (conservative assumption, no sourced exemption found) (D8).
- If the allowed space splits into pieces, only the largest is kept (D17).
- Consolidated MR 55 after MR 61 / MR 68 not verified; ข้อ 48 spacing is from a secondary source; window-wall rule for ≥ 23 m unknown.
- Corner plots / two roads: the widest detected road is used for the whole plot; ข้อ 45/46 conditions (≤ 60 m) aren't fully modelled.
- Planted-area check is always "check": nothing is drawn.
- Hotel and office rules are partly assumptions.
- No cost range, unit layouts or sun study.
- Live Overpass is slow and can fail; retrying means nudging the plot.
- No Google Photorealistic 3D Tiles (D22).
- Next steps to consider: confirm the consolidated MR 55, verify road width from cadastral or BMA data, real building heights (e.g. Overture / photogrammetry), a cost range, unit mix, a sun/shadow study, the other zones.

### Bugs found and fixed during the build (possible material for the transcripts note; say honestly who caught each)
- Road distance measured to the segment, which under-restricts near plot corners → infinite line (D10).
- Frontage was the longest single edge, which under-counts a curved road drawn as many short edges → continuous run (uncommitted).
- The > 30,000 m² rule needing an 18 m road wasn't capping GFA → added (uncommitted).
- Thin slivers counted as floor plates → minimum plate width (uncommitted).
- Roof allowance: decided to add it to every level (D11).

### Transcripts on disk
`C:\Users\amana\.claude\projects\d--OffCAMPUS-RECUITMENT-Assignment-1\`
- `12629d5f-…jsonl` (7.8 MB), `50971ef9-…jsonl` (4.4 MB), `1ddfc9cf-…jsonl` (this session).
- Open each to confirm which one has the `start_assignment` call. The brief wants the first 2–3 sessions (start, research, planning), raw. Your project rules also commit you to including every session after the start.

---

## C. Outline: what to write in each part

### 1. Live link
- The URL only, plus one line on what loads by default (sample plot in Phrom Phong) and one tip ("click a plot edge to toggle road frontage").

### 2. Repo
- URL. Optionally one line: where the rules live (`starter/src/rules/bangkok.ts`) and how to run the tests.

### 3. One-pager (four headings, one page)

**3.1 What you understood**
- Who the user is (a Bangkok developer before hiring an architect) and the question (how big, how tall, what shape).
- Why it's hard: rules split across the Comprehensive Plan (zone: FAR, OSR, use) and Building Control Act ministerial regulations (setbacks, height plane, high-rise), mostly in Thai; a draft plan that isn't law yet.
- What "done" means to them: real plot outline, real site, live updates, every number traceable.

**3.2 What you did, and why**
- The zone pick and why (D2). The plan-in-force pick (D1). Condo first (D3).
- The flow: draw plot → zone and road detected → rules → stepped envelope → 3 designs with checklist and area statement.
- 2–3 judgement calls in your words: the narrow-road fallback (D7/D18), the fire-access interpretation (D6), estimates shown as estimates (D9/D15).
- What you deliberately dropped (the pre-clock Indian starter, the three.js viewer, Google 3D tiles).

**3.3 Technical decisions, and why** (the brief names these four)
- Stack: MapLibre over three.js, client-only.
- Allowed space: the ข้อ 44 plane turned into a per-floor setback; infinite-line distance; low vs high regime.
- Site data: BMA layer + OSM snapshot + live Overpass; coverage numbers (7% heights, 0.3% widths).
- Smoothness: Web Worker, bundled snapshot, cached cuts per distance. **Measure something real before claiming it** (e.g. analysis time per change, load time on throttled 4G in DevTools). Don't use a number you didn't measure.

**3.4 What's still wrong, and what you'd do next**
- Pick the 4–6 most important gaps from the list above, each with its fix.

### 4. Transcripts
- The note above the links (your own words): 2–3 concrete things the AI missed or got wrong, how you noticed (a test, reading the Thai clause, a number that didn't add up, seeing it in the 3D view), and how you checked it. Use only cases you actually remember. If the AI caught something itself, don't claim it.
- Then the links. Export the raw `.jsonl` (or a rendered copy) to a public place and check each link in a private window.

### 5. Your setup (six answers, all from you; I have no facts here)
1. Tools, models, agents and what each is for.
2. How you run them: e.g. `CLAUDE.md` project rules, the `siliconbricks` MCP endpoint, Playwright for browser checks, parallel sessions if any.
3. Monthly tokens or spend: a real number from your billing page.
4. Most ambitious AI-built project + link + where the AI broke.
5. How you ramp up on a new domain (this assignment is a live example: primary Thai texts, the GIS layer, `DECISIONS.md`).
6. 3D / vision / diffusion / local models: only what you've really done.

### 6. Best project
- One link and one line on which parts were yours.

### 7. About you
- A few lines, then résumé, LinkedIn, GitHub, portfolio. Résumé link must open without sign-in.

---

## D. Before you submit
- [ ] Commit and push the uncommitted changes; `vercel --prod`; re-test the live link.
- [ ] Repo public; doc and all links open in a private window.
- [ ] Every number in the doc matches the live tool.
- [ ] `time_left` checked; same email as start.
- [ ] Receipt ID saved and confirmed with `check_submission`.
