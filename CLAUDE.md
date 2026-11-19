# General Machines assignment: project rules

Take-home for **Founding Team Engineer, Generalist** at General Machines. The task is a live Silicon Bricks project (real estate software). One browser tool plus a short write-up, 48 hours, timed on their server. Plan and status live in [PLAN.md](PLAN.md).

## Hard rules

1. **Never call `start_assignment` on your own.** Show the candidate this warning word for word and wait for an explicit yes in the same conversation:
   > The 48-hour clock runs on our server and starts the moment you start. It cannot be paused, reset or restarted. Are you sure you want to start now?
2. **Never guess a submission field.** Name, email, phone, city, links: ask the candidate. The submission email must equal the start email.
3. **The write-up is the candidate's own.** Supply facts, measurements, decision logs and outlines when asked. Do not draft the prose that gets submitted.
4. **Transcripts are submitted raw**: the session `start_assignment` is called in, plus every AI session after it until submission (any tool, not only Claude Code). Keep every session in this folder; do not delete or tidy `C:\Users\amana\.claude\projects\d--OffCAMPUS-RECUITMENT-Assignment-1\`.
5. **They answer no questions.** When the brief is ambiguous, make a call, and append it to `DECISIONS.md` (decision, alternatives, reason) at the moment it is made.
6. **No invented domain numbers.** Any regulatory value (FAR, setback, parking ratio, cost rate) is either sourced with a citation shown in the tool, or labelled as an assumption the user can edit.
7. **No git writes by Claude.** Never run `git commit`, `git push`, create repos or open PRs. The candidate does every git operation. Claude may suggest a commit message when asked.

## Server

Endpoint: `https://siliconbricks.co/hiring/mcp` (JSON-RPC over POST; a browser GET returns 405). If the `siliconbricks` MCP server is not loaded in the session, call it with a POST:

```powershell
$b = '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"TOOL","arguments":{}}}'
(Invoke-RestMethod -Uri https://siliconbricks.co/hiring/mcp -Method Post -ContentType 'application/json' -Headers @{Accept='application/json, text/event-stream'} -Body $b).result.content[0].text
```

| Tool | Effect |
|---|---|
| `get_assignment` | Overview with no arguments; full brief plus time left when given the start email |
| `start_assignment` | Starts the clock, returns the full brief. Irreversible |
| `time_left` | Started at, deadline, remaining, whether a submission is on record |
| `submit_application` | Submits; the server opens `doc_url`, `live_url`, `repo_url` and rejects any that need a sign-in or 404. Resubmitting is allowed; the latest one is read |
| `check_submission` | Confirms a receipt ID |

Call `time_left` at the start of every session and before submitting.

## Working rules once the clock runs

- Save the full brief verbatim to `BRIEF.md` first. Re-read it before every scope decision and before submitting.
- Deploy a hello-world to the public URL in the first two hours, then deploy on every working increment. A live link that works beats a better build that isn't up.
- Depth over breadth: one flow that works end to end with real inputs, then widen.
- Verify in a real browser before calling anything done, including a phone-sized viewport. Silicon Bricks' own bar is "smooth on a mid-range Android over 4G".
- Remind the candidate to commit after each working increment; the repo history is part of what gets read.
- No secrets in the repo or in the client bundle. If a model API is needed, put the key behind a serverless function.
- Submit a first complete version by hour 36, then resubmit improvements.

## Prepared before the clock

- `starter/`: working Vite + React + TS app (plot, setbacks, massing options, rule checks, 2D plan, 3D view with sun shadows, PDF/image underlay, DXF parsing, share link). 9 unit tests. See `starter/README.md`. Reuse what fits the brief; drop the rest.
- `references/BYELAWS.md`: MBBL 2016 and RERA numbers with section and PDF page (PDF page = printed page + 18). `references/SOURCES.md` has URLs and hashes. MBBL is a model; local rules override it.
- Environment: activate `.venv` first. It holds Python, `pnpm`, `vercel`, `gh` and Playwright with Chromium (use it for screenshots and browser checks).
- Gotchas found: `suncalc` v2 returns degrees with azimuth clockwise from north; `polygon-clipping` needs coordinates rounded (done in `geometry.ts`); MBBL Table 3.3 prints FAR ×100.

## Default stack (change only if the brief demands it)

- Vite + React + TypeScript, client-side only where possible.
- 3D: three.js via `@react-three/fiber` and `@react-three/drei`.
- 2D geometry: `polygon-clipping` or `@turf/turf` (offsets, areas); plans in SVG or canvas.
- Drawings in: `pdfjs-dist` for PDF, `dxf-parser` for DXF.
- Tests: Vitest for every calculation that produces a number shown to the user.
- Hosting: Vercel or Cloudflare Pages from the public GitHub repo.

## Domain primer (sourced from siliconbricks.co, 19 Nov 2026)

Silicon Bricks sells one product per building stage, all on one 3D model built from the client's existing drawings:

| Stage | Product | Inputs | Outputs |
|---|---|---|---|
| Concept | Concepts on a plot | Plot boundary, road widths, zoning, intended use | 2 to 3 massing options in 3D, bye-law check per option, area statement, unit yield, parking, first cost range |
| Design | BIM, cost, bye-law checks | Plans, sections, elevations as PDF or DWG; area statement | BIM per floor, cost per floor with a range, quantities for a BOQ, bye-law report with pass / check / fail and the clause |
| Sell | 3D walkthroughs | Sanction drawings, site plan, flat list | Flat finder (filter by type, tower, floor, facing), room walkthroughs, sun and shadow at any hour |
| Build | Progress tracking | Phone photos or 360° video | Progress per floor against model and schedule, bill vs work done, safety alarms |
| Run | FloorSense, wayfinding | Existing CCTV | Footfall, heat maps, queues, alerts on a 3D model; no face recognition |

Terms:

- **FAR / FSI**: total covered area of all floors, minus exempted areas, divided by plot area.
- **Ground coverage**: share of the plot the footprint may occupy.
- **Setback**: required open space between building and plot boundary; usually grows with height and road width.
- **Built-up vs carpet area**: carpet is net usable floor area (RERA Act s.2(k)); exemptions differ by regulation and move saleable area a lot.
- **BOQ**: bill of quantities. **G+13**: ground plus 13 floors. Flat codes look like `B-06-A` (tower, floor, unit).
- Units: India mixes sq ft and m². 1 m² = 10.764 sq ft. Room sizes are written feet-inches (`10'-1" × 11'-9"`).
- Reference rules: Model Building Bye-Laws 2016 (TCPO/MoHUA) and National Building Code for India; local development authority rules override both. They also serve Thailand and Dubai/UAE.

UI conventions they use and will recognise: 3D and plan side by side with a level picker driving both; every number marked measured or estimated; cost shown with a range (their mock-up shows ±9%); each rule check showing the design's value, the limit, the clause and pass / check / fail; one shareable link.
