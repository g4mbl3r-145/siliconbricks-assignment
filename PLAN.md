# Plan: General Machines generalist assignment

Status on 19 Nov 2026: **not started, no clock running.** The full brief is hidden until `start_assignment` is called.

## 1. What is known

- One browser tool plus a short write-up, in an unfamiliar domain, on a project Silicon Bricks is working on now.
- 48 hours on their server clock. No pause, reset or restart. No questions answered.
- Any tools allowed, AI included. Unpaid. Bangalore / hybrid.
- Submission is one doc with seven parts ("section 5 of the brief"). Known parts: part 1 is the live tool link, part 2 is the public repo, part 7 includes the résumé link. Parts 3 to 6 are unknown until the brief is open.
- Raw AI session transcripts are required, starting with the session the assignment is started in.
- The role description values: AI-native working, fast ramp-up that goes deep, end-to-end ownership.

## 2. What is not known

- The task itself. The candidates below are inference from the Silicon Bricks site, not information from the server.
- General Machines has no findable public footprint (no site, no CartTrace-100k listing in search). Silicon Bricks' blog posts are all dated 13 Nov 2026. Both look very new; treat the unpaid 48 hours accordingly.

## 3. Likely task, ranked by my estimate

| # | Candidate | Why it fits | Prep that transfers |
|---|---|---|---|
| 1 | Plot feasibility: boundary and rules in, 2 to 3 massing options with FAR, coverage, setbacks, area statement out | Their newest blog post; small enough for 48 h; "domain you haven't seen" | Polygon offset, extrusion, rule engine, area maths |
| 2 | Floor plan (PDF or image) to 3D model in the browser | Core of every product they sell; matches "plans to 3D" in the role | PDF/DXF parsing, wall extraction, three.js extrusion |
| 3 | Bye-law checker on a model: value, limit, clause, pass / check / fail | Described in detail on their BIM page | Rule engine with cited clauses |
| 4 | Flat finder with walkthrough and sun study | Their one public case study | three.js scene, filters, sun position |
| 5 | Progress or CCTV dashboard on a 3D model | Build and Run products | Model viewer with per-floor data overlay |

All five share a base: a three.js building viewer with a level picker, a linked 2D plan, and a panel of numbers with sources. Preparing that base is safe whichever task appears.

## 4. Before starting the clock

Done (20 Nov 2026):

- [x] `.venv` with Python 3.12, `pnpm` 12.21, Vercel CLI 66.2, GitHub CLI 2.105, Playwright + Chromium.
- [x] `starter/` app built, 9 unit tests passing, checked in a browser at desktop and phone widths, shadows verified.
- [x] `references/BYELAWS.md` with MBBL 2016 and RERA numbers, three citations spot-checked against the PDF.
- [x] Silicon Bricks product research (in `CLAUDE.md`).

Still yours (needs your accounts):

- [ ] `gh auth login`, then push a throwaway public repo to confirm it works.
- [ ] Hosting: either `vercel login` and deploy `starter/` once, or enable GitHub Pages on the throwaway repo. Open the URL on your phone.
- [ ] Résumé uploaded with a link anyone can open without signing in. Test in a private window.
- [ ] A Google Doc created for the submission, sharing set to "anyone with the link can view". Test in a private window.
- [ ] Submission details ready: full name, email (same one for start and submit), phone with country code, current city, Bangalore / hybrid answer, LinkedIn URL, GitHub URL. Optional: X handle, portfolio, other project links, a note.
- [ ] An API key for a model provider if the task needs one in production, with spend limits set.

Practice, no clock:

- [ ] Run `starter/` (`pnpm dev`), read its code until you can explain every file. You will be asked about it.
- [ ] Read `references/BYELAWS.md`, sections 3 to 6 at least.
- [ ] Open the live Aayra walkthrough on a phone to see their quality bar: `https://siliconbricks.co/aayra/explore/#/B/6/A/inside`
- [ ] Find 2 to 3 real sample inputs (a site plan PDF, a floor plan image, a DXF) to test with.

Disclosure (my recommendation): say in the write-up that `starter/` and the reference notes were prepared before the clock started. The transcripts show it anyway.

Timing:

- [ ] Two full days clear, with sleep planned in. Do not start late at night.
- [ ] Start in a Claude Code session opened in this folder, so the transcript is on disk and exportable.

## 5. The 48 hours

| Hours | Work | Done when |
|---|---|---|
| 0 to 1 | Start. Save brief to `BRIEF.md`. Read it twice. List the seven doc parts and every stated requirement as a checklist in this file | Checklist written |
| 1 to 3 | Scope: pick the one flow that must work end to end; write assumptions to `DECISIONS.md`. Create repo, deploy hello-world to the public URL | Public URL loads |
| 3 to 5 | Domain ramp-up on the specific task; collect 2 to 3 real sample inputs | Sample inputs in repo |
| 5 to 16 | Core flow with real input, ugly but correct. Unit tests on every calculation | Flow works on sample 1, deployed |
| 16 to 23 | Sleep | |
| 23 to 32 | Depth: remaining samples, edge cases, error states, numbers marked measured or estimated, sources cited | Works on all samples |
| 32 to 36 | UI polish, phone viewport, load time, README | **First submission sent** |
| 36 to 40 | Sleep or buffer | |
| 40 to 45 | Write-up in the doc, in your own words, from `DECISIONS.md`. Export transcripts. Fresh-browser test of all four links | Doc complete |
| 45 to 47 | Final resubmission, then `check_submission` with the receipt ID | Receipt confirmed |
| 47 to 48 | Buffer only. Nothing new | |

Cut rules: if the core flow is not working by hour 20, cut scope, not sleep. If behind at hour 32, submit what works and say plainly in the doc what is missing.

## 6. Submission checklist

- [ ] `time_left` checked.
- [ ] Doc has all seven parts, in the brief's order, and opens in a private window.
- [ ] Live URL opens in a private window and on a phone, with a sample input preloaded so a reviewer sees a result in one click.
- [ ] Repo is public, has a README with run steps, and contains no secrets.
- [ ] Résumé link opens in a private window; same link as in the doc.
- [ ] Transcripts exported from `C:\Users\amana\.claude\projects\d--OffCAMPUS-RECUITMENT-Assignment-1\` and linked, starting with the start session.
- [ ] Same email as the start call.
- [ ] Receipt ID saved and verified with `check_submission`.

## 7. Open items for you

- Which name and email to register (the résumé and this machine's account show different names).
- Which 48-hour window you will use.
