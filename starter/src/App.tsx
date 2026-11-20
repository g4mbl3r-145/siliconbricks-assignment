import { useEffect, useMemo, useRef, useState } from 'react'
import { useAnalysis } from './lib/useAnalysis'
import MapView, { type Show } from './components/MapView'
import PlanView from './components/PlanView'
import { area, selfIntersects, type Poly } from './lib/geometry'
import { meanLL, projector, type LL } from './lib/project'
import type { Ctx, Design, Result, Status } from './lib/designs'
import { accessOk, frontage, type Envelope } from './lib/envelope'
import { contextGeoJSON, covers, detectRoad, fetchContext, fetchZone, nearestStation, onPlot, rai, zoneAt, type Context, type ZoneFC } from './lib/site'
import {
  ACCESS_ROAD_M, ASSUME_DEFAULT, ASSUME_LABEL, FLAGS_ON, FRONTAGE_M, REF, SCOPE_ZONE, USES, roadSetback, zoneRef,
  type Assumptions, type Basis, type Flags, type Ref, type Use, type Zone,
} from './rules/bangkok'

interface State {
  pts: LL[]
  road: boolean[]
  width: number
  widthBasis: string
  roadName: string
  use: Use
  a: Assumptions
  f: Flags
  d: number
}

const SAMPLE: State = {
  pts: [[100.5710767, 13.7324178], [100.5711995, 13.7329283], [100.5715331, 13.7328144], [100.571522, 13.7326497], [100.5716528, 13.732601], [100.5715405, 13.7322924]],
  road: [true, false, false, false, false, false],
  width: 12,
  widthBasis: 'estimate from OSM road class “tertiary”',
  roadName: 'Soi Sukhumvit 39',
  use: 'condo',
  a: ASSUME_DEFAULT.condo,
  f: FLAGS_ON,
  d: 0,
}

const load = (): State => {
  try {
    const s = { ...SAMPLE, ...JSON.parse(decodeURIComponent(atob(location.hash.slice(1)))) } as State
    if (!(s.pts.length >= 3 && s.road.length === s.pts.length && s.use in USES)) return SAMPLE
    return { ...s, a: { ...ASSUME_DEFAULT[s.use], ...s.a }, f: { ...FLAGS_ON, ...s.f } }
  } catch {
    return SAMPLE
  }
}

const n0 = (v: number) => Math.round(v).toLocaleString('en-US')
const n1 = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })
const n2 = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })

const BASIS_LABEL: Record<Basis, string> = { sourced: 'sourced', secondary: 'secondary source', interpretation: 'interpretation', assumption: 'assumption' }
const Badge = ({ b }: { b: Basis }) => <span className={`basis ${b}`}>{BASIS_LABEL[b]}</span>
const Cite = ({ r }: { r: Ref }) => (
  <div className="cite">
    <a href={r.url} target="_blank" rel="noreferrer">{r.clause}</a> <Badge b={r.basis} />
    {r.note && <div className="muted">{r.note}</div>}
  </div>
)
const Tag = ({ s }: { s: Status }) => <span className={`tag ${s}`}>{s}</span>

interface Tag {
  origin: LL
  plot: Poly
  zone: Zone
  road: boolean[]
}
interface Model {
  ok: true
  plot: Poly
  pr: ReturnType<typeof projector>
  r: Result
  zone: Zone
  road: boolean[]
  ms: number
}
type Bad = { ok: false; why: string }

const toFC = (pr: Model['pr'], items: { poly: Poly; props: Record<string, unknown> }[]): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: items.filter(x => x.poly.length > 2).map(({ poly, props }) => {
    const ring = poly.map(pr.toLL)
    return { type: 'Feature', properties: props, geometry: { type: 'Polygon', coordinates: [[...ring, ring[0]]] } }
  }),
})

const envFC = (pr: Model['pr'], env: Envelope) => {
  const blocks: { poly: Poly; props: Record<string, unknown> }[] = []
  for (const l of env.levels) {
    const last = blocks.at(-1)
    if (last && last.props.sb === l.roadSb) last.props.top = l.top
    else blocks.push({ poly: l.poly, props: { base: l.base, top: l.top, sb: l.roadSb } })
  }
  return toFC(pr, blocks)
}

const designFC = (pr: Model['pr'], d: Design) =>
  toFC(pr, d.floors.flatMap(f => f.polys.map(poly => ({ poly, props: { base: f.base, top: Math.max(f.base + 0.5, f.top - 0.25), level: f.i, use: f.use } }))))

const groups = (d: Design) => {
  const out: { from: number; to: number; use: string; area: number; n: number }[] = []
  for (const f of d.floors) {
    const g = out.at(-1)
    if (g && g.use === f.use && Math.abs(g.area - f.area) < 0.5) { g.to = f.i; g.n++ } else out.push({ from: f.i, to: f.i, use: f.use, area: f.area, n: 1 })
  }
  return out
}

const USE_NAME = (u: string, use: Use) => (u === 'lobby' ? 'Lobby, services' : u === 'parking' ? 'Parking' : USES[use].label)
const lvl = (i: number) => (i === 0 ? 'G' : `L${i}`)

export default function App() {
  const [s, setS] = useState<State>(load)
  const [snapshot, setSnapshot] = useState<Context | null>(null)
  const [live, setLive] = useState<{ ctx: Context | null; status: string }>({ ctx: null, status: '' })
  const [zonesFC, setZonesFC] = useState<ZoneFC | null>(null)
  const [liveZone, setLiveZone] = useState<{ at: string; z: Zone | null } | null>(null)
  const [level, setLevel] = useState<number | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [focus, setFocus] = useState(0)
  const [show, setShow] = useState<Show>({ envelope: true, design: true, context: true, zones: false, satellite: false })
  const [importMsg, setImportMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'checks' | 'areas'>('checks')
  const lastGood = useRef<Model | null>(null)

  useEffect(() => {
    fetch('/context.json').then(r => r.json()).then(setSnapshot).catch(() => setSnapshot(null))
    fetch('/zones.geojson').then(r => r.json()).then(setZonesFC).catch(() => setZonesFC(null))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => history.replaceState(null, '', `#${btoa(encodeURIComponent(JSON.stringify(s)))}`), 300)
    return () => clearTimeout(t)
  }, [s])

  const centre = useMemo(() => meanLL(s.pts), [s.pts])
  const inSnap = covers(snapshot, centre)
  const ctx = inSnap ? snapshot : live.ctx

  // Outside the bundled snapshot: read buildings and roads from the basemap's vector tiles at once,
  // then try Overpass (richer tags) in the background and swap it in if it answers.
  const key = `${centre[0].toFixed(3)},${centre[1].toFixed(3)}`
  const needLive = !!snapshot && !inSnap && !(live.ctx && covers(live.ctx, centre))
  const [tilesFor, setTilesFor] = useState('')
  useEffect(() => {
    if (!needLive) return
    setLive(l => ({ ...l, status: 'Reading surrounding buildings from the map tiles…' }))
    setTilesFor(key)
    const ctl = { stop: false }
    const t = setTimeout(() => {
      fetchContext(centre).then(c => { if (!ctl.stop) setLive({ ctx: c, status: '' }) }).catch(() => setLive(l => ({ ...l, status: '' })))
    }, 800)
    return () => { ctl.stop = true; clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needLive, key])
  const onTiles = (c: Context) => setLive(l => (l.ctx && l.ctx.source.includes('Overpass') && covers(l.ctx, centre) ? l : { ctx: c, status: '' }))

  useEffect(() => {
    if (!live.ctx || !s.widthBasis.startsWith('no mapped road')) return
    const g = detectRoad(live.ctx, s.pts)
    if (!g.basis.startsWith('no mapped road')) setS(o => ({ ...o, road: g.road, width: g.width, widthBasis: g.basis, roadName: g.name }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live.ctx])

  const bundledZone = useMemo(() => zoneAt(zonesFC, centre), [zonesFC, centre])
  const zKey = `${centre[0].toFixed(4)},${centre[1].toFixed(4)}`
  useEffect(() => {
    if (!zonesFC || bundledZone || liveZone?.at === zKey) return
    const t = setTimeout(() => fetchZone(centre).then(z => setLiveZone({ at: zKey, z })).catch(() => setLiveZone({ at: zKey, z: null })), 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zonesFC, bundledZone, zKey])
  const zone: Zone | null = bundledZone ?? (liveZone?.at === zKey ? liveZone.z : null)
  const zonePending = !bundledZone && liveZone?.at !== zKey

  const ds = s
  const station = useMemo(() => nearestStation(ctx, centre), [ctx, centre])

  const input = useMemo((): { ok: true; job: { ctx: Ctx; tag: Tag } } | Bad => {
    if (s.pts.length < 3) return { ok: false, why: 'Draw at least three corners.' }
    const origin = meanLL(s.pts)
    const pr = projector(origin)
    const plot = s.pts.map(pr.toM)
    if (selfIntersects(plot)) return { ok: false, why: 'Plot edges cross each other. Drag a corner back, or right-click a corner to delete it.' }
    const A = area(plot)
    if (A < 100) return { ok: false, why: 'Plot is under 100 m². Draw a development plot.' }
    if (A > 200_000) return { ok: false, why: 'Plot is over 20 ha. Draw a single development plot.' }
    if (!zone) return { ok: false, why: zonePending ? 'Looking up the zone…' : 'This location is outside the Bangkok zoning layer. Move the plot into Bangkok.' }
    if (s.road.length !== s.pts.length) return { ok: false, why: 'Updating…' }
    const site = { plot, road: s.road, width: s.width }
    return { ok: true, job: { ctx: { site, zone, use: s.use, a: s.a, f: s.f, stationM: station?.m ?? null }, tag: { origin, plot, zone, road: s.road } } }
  }, [s.pts, s.road, s.width, s.use, s.a, s.f, zone, zonePending, station])
  const job = useMemo(() => (input.ok ? input.job : null), [input])
  const out = useAnalysis(job)
  if (out && !('error' in out)) {
    const { origin, plot, zone: z, road } = out.tag
    if (lastGood.current?.r !== out.r) lastGood.current = { ok: true, plot, pr: projector(origin), r: out.r, zone: z, road, ms: out.ms }
  }
  const model: Model | Bad = !input.ok ? input : out && 'error' in out ? { ok: false, why: `Calculation error: ${out.error}` } : lastGood.current ?? { ok: false, why: 'Calculating…' }
  const M = lastGood.current
  const design = M ? M.r.designs[Math.min(s.d, M.r.designs.length - 1)] : null
  const env = M && design ? (design.regime === 'high' ? M.r.envHigh : M.r.envLow) : null

  const overlap = useMemo(() => onPlot(ctx, ds.pts), [ctx, ds.pts])
  const overlapKey = overlap.join(',')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const contextFC = useMemo(() => contextGeoJSON(ctx, new Set(overlap)), [ctx, overlapKey])

  const mapData = useMemo(() => ({
    plot: s.pts,
    road: s.road,
    envelope: M && env ? envFC(M.pr, env) : { type: 'FeatureCollection' as const, features: [] },
    design: M && design ? designFC(M.pr, design) : { type: 'FeatureCollection' as const, features: [] },
    context: contextFC,
    zones: zonesFC as unknown as GeoJSON.FeatureCollection,
  }), [s.pts, s.road, M, env, design, contextFC, zonesFC])

  const set = (p: Partial<State>) => setS(o => ({ ...o, ...p }))

  const onPlotChange = (pts: LL[], kind: 'move' | 'insert' | 'delete' | 'new', at?: number) => {
    setS(o => {
      if (kind === 'move') return { ...o, pts }
      if (kind === 'insert') { const road = [...o.road]; road.splice(at! + 1, 0, o.road[at!]); return { ...o, pts, road } }
      if (kind === 'delete') { const road = [...o.road]; road.splice(at!, 1); return { ...o, pts, road } }
      const g = detectRoad(ctx, pts)
      return { ...o, pts, road: g.road, width: g.width, widthBasis: g.basis, roadName: g.name }
    })
    if (kind === 'new') { setLevel(null); setFocus(f => f + 1) }
  }

  const share = async () => {
    try { await navigator.clipboard.writeText(location.href); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* clipboard blocked */ }
  }

  const plotA = M ? M.r.plotArea : 0
  const site = M ? { plot: M.plot, road: M.road, width: s.width } : null
  const hasRoad = s.road.some(Boolean)
  const fr = site && site.road.length === site.plot.length ? frontage(site) : 0
  const access = site && site.road.length === site.plot.length ? accessOk(site) : false
  const floorAt = design && level !== null ? design.floors.find(f => f.i === level) : design?.floors[0]
  const envAt = env && level !== null ? env.levels.find(l => l.i === level) : env?.levels[0]

  return (
    <div className="app">
      <header>
        <div className="brand">
          <h1>Plot to concept · Bangkok</h1>
          <span className="sub">What can I build on this plot? Rules, allowed space and concept designs, live.</span>
        </div>
        <div className="hdr-right">
          {zone && <span className="chip">{zone.sub} · FAR {zone.far} · OSR {zone.osr}%</span>}
          <button onClick={share}>{copied ? 'Link copied' : 'Copy share link'}</button>
        </div>
      </header>

      <aside className="panel left">
        <section>
          <h2>1 · Plot</h2>
          <p className="big">{n0(plotA)} m² <span className="muted">· {rai(plotA)} · {s.pts.length} corners · measured from drawing</span></p>
          <div className="row">
            <button className={drawing ? 'on' : ''} onClick={() => setDrawing(d => !d)}>{drawing ? 'Cancel drawing' : 'Draw new plot'}</button>
            <button onClick={() => { setS({ ...SAMPLE, use: s.use, a: s.use === SAMPLE.use ? SAMPLE.a : ASSUME_DEFAULT[s.use] }); setLevel(null); setFocus(f => f + 1) }}>Sample plot</button>
            <button onClick={() => setFocus(f => f + 1)}>Zoom to plot</button>
          </div>
          <div className="row" style={{ marginTop: 6 }}>
            <label className="filebtn">Import KML / KMZ
              <input type="file" accept=".kml,.kmz,application/vnd.google-earth.kml+xml,application/vnd.google-earth.kmz" onChange={async e => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (!f) return
                try {
                  const { readKmlFile } = await import('./lib/kml')
                  const pts = await readKmlFile(f)
                  onPlotChange(pts, 'new')
                  setImportMsg(`Imported ${pts.length} corners from ${f.name}.`)
                } catch (err) { setImportMsg(err instanceof Error ? err.message : String(err)) }
              }} />
            </label>
            <button onClick={async () => {
              const { toKml } = await import('./lib/kml')
              const a = document.createElement('a')
              a.href = URL.createObjectURL(new Blob([toKml(s.pts, `Plot ${n0(plotA)} m²`)], { type: 'application/vnd.google-earth.kml+xml' }))
              a.download = 'plot.kml'
              a.click()
              URL.revokeObjectURL(a.href)
            }}>Export KML</button>
          </div>
          {importMsg && <p className="muted">{importMsg}</p>}
          <p className="muted">From Google Earth Pro: draw the plot with Add Polygon, then Save Place As… KML/KMZ and import it here.</p>
          <p className="hint">
            {drawing
              ? 'Click corners on the map. Click the first corner or press Enter to close. Backspace undoes, Esc cancels.'
              : 'Drag a corner to reshape. Click a white mid-point to add a corner; right-click or double-click a corner to remove it.'}
          </p>
        </section>

        <section>
          <h2>2 · Road</h2>
          <p className="hint">Red edges face the public road. Click any plot edge on the map to toggle it.</p>
          <label>Road right-of-way width (m){s.roadName && <span className="muted"> · {s.roadName}</span>}
            <input type="number" min={2} max={80} step={0.5} value={s.width}
              onChange={e => { const v = Number(e.target.value); if (v > 0) set({ width: v, widthBasis: 'entered by user' }) }} />
          </label>
          <p className="muted">{s.widthBasis === 'entered by user' ? 'Entered by user.' : <>Estimated: {s.widthBasis}. Enter the surveyed width; the law uses the full right-of-way along its whole length.</>}</p>
          <p className="muted">Frontage {n1(fr)} m on {s.road.filter(Boolean).length} edge(s){!hasRoad && <b className="bad"> · no road edge marked</b>}</p>
        </section>

        <section>
          <h2>3 · Building type</h2>
          <div className="seg">
            {(Object.keys(USES) as Use[]).map(u => (
              <button key={u} className={s.use === u ? 'on' : ''} onClick={() => set({ use: u, a: { ...ASSUME_DEFAULT[u], bonusOpen: s.a.bonusOpen } })}>{USES[u].label}</button>
            ))}
          </div>
          <p className="muted">{USES[s.use].thai}</p>
        </section>

        <section>
          <h2>4 · Zone and rules</h2>
          {zone ? (
            <>
              <p><b>{zone.sub}</b> · Bangkok Comprehensive Plan B.E. 2556 · looked up from the BMA zoning layer at the plot centre.</p>
              {zone.code !== SCOPE_ZONE && <p className="warn">This tool models {SCOPE_ZONE} in full. For {zone.code} FAR and OSR come from the official layer, but use conditions are not checked.</p>}
              <p className="muted">Nearest rail station: {station ? `${station.name}, ${n0(station.m)} m (centre to station point, approximate)` : 'unknown'}</p>
            </>
          ) : <p className="muted">{zonePending ? 'Looking up zone…' : 'No zone at this location.'}</p>}
          {M && (
            <div className="rules">
              <Rule on={s.f.far} toggle={v => set({ f: { ...s.f, far: v } })} name="Floor area ratio" value={`${n2(M.r.farEff)} : 1 → max ${n0(M.r.maxGfa)} m²`} r={zoneRef(M.zone, `FAR ${M.zone.far}:1`)} />
              <Rule on={s.f.open} toggle={v => set({ f: { ...s.f, open: v } })} name="Open space" value={`OSR ≥ ${M.zone.osr}% of floor area, and ≥ ${USES[s.use].openShare * 100}% of largest floor`} r={USES[s.use].openRef} />
              <Rule on={s.f.road} toggle={v => set({ f: { ...s.f, road: v } })} name="Road setback" value={`${n2(roadSetback(s.width, true))} m from road boundary`} r={REF.road} />
              <Rule on={s.f.side} toggle={v => set({ f: { ...s.f, side: v } })} name="Side and rear setbacks" value="3 m below 23 m · 6 m for a high-rise" r={REF.side} extra={REF.fire} />
              <Rule on={s.f.plane} toggle={v => set({ f: { ...s.f, plane: v } })} name="Height vs road" value={`height ≤ 2 × (${n1(s.width)} m + distance from road)`} r={REF.plane} />
              <Rule on={s.f.access} toggle={v => set({ f: { ...s.f, access: v } })} name="High-rise access"
                value={access ? `road ${n1(s.width)} m ≥ ${ACCESS_ROAD_M} m and frontage ${n1(fr)} m ≥ ${FRONTAGE_M} m: high-rise allowed` : `needs road ≥ ${ACCESS_ROAD_M} m and frontage ≥ ${FRONTAGE_M} m: capped below 23 m and 10,000 m²`} r={REF.access} bad={!access} />
            </div>
          )}
          <p className="hint">Untick a rule to see how it shapes the allowed space. Checklists still test every rule.</p>
        </section>

        <section>
          <h2>5 · Assumptions <span className="basis assumption">editable</span></h2>
          {(Object.keys(ASSUME_LABEL) as (keyof Assumptions)[]).filter(k => !(k === 'unitSize' && s.use === 'office')).map(k => (
            <label key={k}>{ASSUME_LABEL[k][0]}{ASSUME_LABEL[k][1] && ` (${ASSUME_LABEL[k][1]})`}
              <input type="number" step={k === 'efficiency' ? 0.05 : k === 'plate' || k === 'bonusOpen' ? 50 : 0.1} min={0} value={s.a[k]}
                onChange={e => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= 0) set({ a: { ...s.a, [k]: v } }) }} />
            </label>
          ))}
          {s.a.bonusOpen > 0 && <Cite r={REF.bonus} />}
        </section>
      </aside>

      <main className="center">
        <MapView data={mapData} show={show} level={level} drawing={drawing} focus={focus}
          onPlot={onPlotChange} onEdge={i => set({ road: s.road.map((v, j) => (j === i ? !v : v)) })} onDrawEnd={() => setDrawing(false)} tilesFor={tilesFor} onTiles={onTiles} />
        {!model.ok && <div className="banner">{model.why}</div>}
        {live.status && <div className="banner info">{live.status}</div>}
        <div className="overlay toggles">
          {(Object.keys(show) as (keyof Show)[]).map(k => (
            <label key={k} className="tog"><input type="checkbox" checked={show[k]} onChange={e => setShow({ ...show, [k]: e.target.checked })} />
              {{ envelope: 'Allowed space', design: 'Design', context: 'Surroundings', zones: 'Zoning map', satellite: 'Satellite' }[k]}</label>
          ))}
          <div className="legend">
            <span><i style={{ background: '#f97316', opacity: 0.5 }} />allowed</span>
            <span><i style={{ background: '#f8fafc', border: '1px solid #94a3b8' }} />{USES[s.use].label.toLowerCase()}</span>
            <span><i style={{ background: '#64748b' }} />parking</span>
            <span><i style={{ background: '#a8a29e' }} />OSM height</span>
            <span><i style={{ background: '#d6d3d1' }} />height estimated</span>
          </div>
        </div>
        {design && design.floors.length > 0 && (
          <div className="overlay levels">
            <button className={level === null ? 'on' : ''} onClick={() => setLevel(null)}>All</button>
            {[...design.floors].reverse().map(f => (
              <button key={f.i} className={level === f.i ? 'on' : ''} onClick={() => setLevel(f.i)} title={`${USE_NAME(f.use, s.use)} · ${n0(f.area)} m²`}>{lvl(f.i)}</button>
            ))}
          </div>
        )}
        {M && env && (
          <div className="overlay planbox">
            <PlanView plot={M.plot} road={M.road} ground={env.levels[0]?.poly ?? []} level={envAt?.poly ?? []} floor={floorAt?.polys ?? []}
              label={`Plan · ${level === null ? 'ground' : lvl(level)}${floorAt ? ` · ${n0(floorAt.area)} m²` : ''}`} />
          </div>
        )}
      </main>

      <aside className="panel right">
        {M && (
          <>
            <h2>Concept designs</h2>
            <div className="cards">
              {M.r.designs.map((d, i) => {
                const fails = d.checks.filter(c => c.status === 'fail').length
                const checks = d.checks.filter(c => c.status === 'check').length
                return (
                  <button key={d.key} className={`card ${i === s.d ? 'on' : ''}`} onClick={() => { set({ d: i }); setLevel(null) }}>
                    <b>{d.name}</b>
                    {d.error ? <span className="bad">{d.error}</span> : (
                      <>
                        <span>{d.floors.length} floors · {n1(d.height)} m · FAR {n2(d.far)}</span>
                        <span>{n0(d.gfa)} m²{d.units ? ` · ${n0(d.units)} ${USES[s.use].unitLabel}` : ''}</span>
                        <span className={fails ? 'bad' : 'good'}>{fails ? `${fails} fail` : 'all rules pass'}{checks ? ` · ${checks} to check` : ''}</span>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
            {design && !design.error && (
              <>
                <p className="muted">{design.blurb}</p>
                <p className="limit"><b>FAR {n2(design.far)} of {n2(M.r.farEff)}.</b> {design.limitedBy}</p>
                <div className="tabs">
                  <button className={tab === 'checks' ? 'on' : ''} onClick={() => setTab('checks')}>Rule checklist</button>
                  <button className={tab === 'areas' ? 'on' : ''} onClick={() => setTab('areas')}>Area statement</button>
                </div>
                {tab === 'checks' ? (
                  <table className="checks">
                    <thead><tr><th>Rule</th><th>Design</th><th>Limit</th><th /></tr></thead>
                    <tbody>
                      {design.checks.map(c => (
                        <tr key={c.id}>
                          <td><b>{c.name}</b><Cite r={c.ref} />{c.note && c.note !== c.ref.note && <div className="muted">{c.note}</div>}</td>
                          <td>{c.value}</td>
                          <td>{c.limit}</td>
                          <td><Tag s={c.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <>
                    <table className="areas">
                      <thead><tr><th>Levels</th><th>Use</th><th>Per floor</th><th>Total m²</th></tr></thead>
                      <tbody>
                        {groups(design).map(g => (
                          <tr key={g.from}>
                            <td>{g.from === g.to ? lvl(g.from) : `${lvl(g.from)}–${lvl(g.to)}`}</td>
                            <td>{USE_NAME(g.use, s.use)}</td>
                            <td>{g.n} × {n0(g.area)}</td>
                            <td>{n0(g.n * g.area)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr><th colSpan={3}>Total floor area (sum of floors)</th><td><b>{n0(design.gfa)}</b></td></tr>
                      </tfoot>
                    </table>
                    <table>
                      <tbody>
                        <tr><th>Plot area <Badge b="sourced" /></th><td>{n0(plotA)} m² (measured)</td></tr>
                        <tr><th>FAR = {n0(design.gfa)} ÷ {n0(plotA)}</th><td>{n2(design.far)} of {n2(M.r.farEff)} allowed</td></tr>
                        <tr><th>Building footprint</th><td>{n0(design.cover)} m² ({n1((design.cover / plotA) * 100)}% of plot)</td></tr>
                        <tr><th>Open space</th><td>{n0(design.open)} m²</td></tr>
                        <tr><th>Height incl. roof allowance</th><td>{n1(design.height)} m · {design.floors.length} floors</td></tr>
                        <tr><th>{USES[s.use].label} floor area</th><td>{n0(design.mainArea)} m²</td></tr>
                        <tr><th>Net {s.use === 'office' ? 'lettable' : 'saleable'} <Badge b="assumption" /></th><td>{n0(design.net)} m² at {n0(s.a.efficiency * 100)}% efficiency</td></tr>
                        {design.units > 0 && <tr><th>{USES[s.use].unitLabel} <Badge b="assumption" /></th><td>{n0(design.units)} at {s.a.unitSize} m² average</td></tr>}
                        <tr><th>Parking</th><td>{n0(design.spacesProv)} provided · {n0(design.spacesReq)} required</td></tr>
                      </tbody>
                    </table>
                    <p className="muted">Areas are computed from the drawn geometry. Parking floors are counted in FAR (no sourced exemption found). Estimates depend on the assumptions in panel 5.</p>
                  </>
                )}
              </>
            )}
          </>
        )}
        <footer className="muted">
          Rules: Bangkok Comprehensive Plan B.E. 2556; Building Control Act ministerial regulations 33, 55; Bangkok Building Control Ordinance 2544.
          Buildings and roads © OpenStreetMap contributors{ctx?.fetched ? ` (data ${ctx.fetched.slice(0, 10)})` : ''}. Basemap OpenFreeMap. Concept-stage estimate, not a permit check.
        </footer>
      </aside>
    </div>
  )
}

function Rule({ on, toggle, name, value, r, extra, bad }: { on: boolean; toggle: (v: boolean) => void; name: string; value: string; r: Ref; extra?: Ref; bad?: boolean }) {
  return (
    <div className={`rule ${on ? '' : 'off'}`}>
      <label className="tog"><input type="checkbox" checked={on} onChange={e => toggle(e.target.checked)} /><b>{name}</b></label>
      <div className={bad ? 'bad' : ''}>{value}</div>
      <Cite r={r} />
      {extra && <Cite r={extra} />}
    </div>
  )
}
