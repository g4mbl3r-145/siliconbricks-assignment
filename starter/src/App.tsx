import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import PlanView, { type Underlay } from './components/PlanView'
import Viewer from './components/Viewer'
import { area, inset, rect, SQFT_PER_M2, type Poly, type Pt } from './lib/geometry'
import { options, type Rules } from './lib/massing'
import { sunDir } from './lib/sun'

interface State {
  plot: Poly
  setbacks: number[]
  far: number
  maxCoverage: number
  maxHeight: number
  floorHeight: number
  lat: number
  lng: number
  when: string
}

const DEFAULT: State = {
  plot: rect(30, 40),
  setbacks: [6, 3, 3, 3],
  far: 2,
  maxCoverage: 0.5,
  maxHeight: 15,
  floorHeight: 3,
  lat: 12.9716,
  lng: 77.5946,
  when: '2026-12-21T10:00',
}

const SOURCE = 'Example value, not from a bye-law. Replace with the applicable rule.'

const load = (): State => {
  try {
    return { ...DEFAULT, ...JSON.parse(decodeURIComponent(atob(location.hash.slice(1)))) }
  } catch {
    return DEFAULT
  }
}

const fmt = (v: number, d = 1) => v.toLocaleString('en-IN', { maximumFractionDigits: d, minimumFractionDigits: d })
const both = (m2: number) => `${fmt(m2)} m² · ${fmt(m2 * SQFT_PER_M2, 0)} sq ft`

export default function App() {
  const [s, setS] = useState<State>(load)
  const [opt, setOpt] = useState(0)
  const [level, setLevel] = useState<number | null>(null)
  const [edge, setEdge] = useState<number | null>(0)
  const [tracing, setTracing] = useState<Pt[] | null>(null)
  const [underlay, setUnderlay] = useState<Underlay | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    history.replaceState(null, '', `#${btoa(encodeURIComponent(JSON.stringify(s)))}`)
  }, [s])

  const set = <K extends keyof State>(k: K, v: State[K]) => setS(p => ({ ...p, [k]: v }))
  const num = (k: keyof State) => (e: ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value) as never)

  const rules: Rules = { far: s.far, maxCoverage: s.maxCoverage, maxHeight: s.maxHeight, floorHeight: s.floorHeight, setbacks: s.setbacks, source: SOURCE }
  const opts = useMemo(() => options(s.plot, rules), [s])
  const o = opts[Math.min(opt, opts.length - 1)]
  const buildable = useMemo(() => inset(s.plot, s.setbacks), [s.plot, s.setbacks])
  const sun = useMemo(() => sunDir(new Date(s.when), s.lat, s.lng), [s.when, s.lat, s.lng])

  const finishTrace = () => {
    if (tracing && tracing.length >= 3 && area(tracing) > 0) {
      setS(p => ({ ...p, plot: tracing, setbacks: tracing.map(() => 3) }))
      setEdge(0)
      setLevel(null)
    }
    setTracing(null)
  }

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const { fileImage, pdfPageImage } = await import('./lib/loaders')
    const img = f.type === 'application/pdf' ? await pdfPageImage(f) : await fileImage(f)
    setUnderlay({ ...img, mPerPx: underlay?.mPerPx ?? 0.02 })
  }

  const share = async () => {
    await navigator.clipboard.writeText(location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="app">
      <header>
        <h1>Plot feasibility</h1>
        <button onClick={share}>{copied ? 'Link copied' : 'Copy share link'}</button>
      </header>

      <aside className="panel">
        <section>
          <h2>Plot</h2>
          <p className="muted">{both(o.plotArea)} · {s.plot.length} edges</p>
          {tracing ? (
            <div className="row">
              <button onClick={finishTrace} disabled={tracing.length < 3}>Finish ({tracing.length} pts)</button>
              <button onClick={() => setTracing(null)}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setTracing([])}>Trace new boundary</button>
          )}
          <label>Underlay (image or PDF)<input type="file" accept="image/*,application/pdf" onChange={onFile} /></label>
          {underlay && (
            <label>Underlay scale (m per px)
              <input type="number" step="0.001" value={underlay.mPerPx} onChange={e => setUnderlay({ ...underlay, mPerPx: Number(e.target.value) })} />
            </label>
          )}
        </section>

        <section>
          <h2>Setback {edge !== null ? `· edge E${edge + 1}` : ''}</h2>
          <p className="muted">Click an edge on the plan to select it.</p>
          {edge !== null && (
            <label>Setback (m)
              <input type="number" min={0} step={0.5} value={s.setbacks[edge] ?? 0}
                onChange={e => set('setbacks', s.setbacks.map((v, i) => (i === edge ? Number(e.target.value) : v)))} />
            </label>
          )}
        </section>

        <section>
          <h2>Rules</h2>
          <p className="warn">{SOURCE}</p>
          <label>FAR / FSI<input type="number" step={0.05} min={0} value={s.far} onChange={num('far')} /></label>
          <label>Max ground coverage (0–1)<input type="number" step={0.05} min={0} max={1} value={s.maxCoverage} onChange={num('maxCoverage')} /></label>
          <label>Max height (m)<input type="number" step={0.5} min={0} value={s.maxHeight} onChange={num('maxHeight')} /></label>
          <label>Floor-to-floor (m)<input type="number" step={0.1} min={2.4} value={s.floorHeight} onChange={num('floorHeight')} /></label>
        </section>

        <section>
          <h2>Sun</h2>
          <label>Date and time (local)<input type="datetime-local" value={s.when} onChange={e => set('when', e.target.value)} /></label>
          <p className="muted">
            {sun[1] > 0
              ? `Altitude ${fmt((Math.asin(sun[1]) * 180) / Math.PI)}° · azimuth ${fmt(((Math.atan2(sun[0], -sun[2]) * 180) / Math.PI + 360) % 360)}° from north`
              : 'Sun below horizon'}
          </p>
          <div className="row">
            <label>Lat<input type="number" step={0.0001} value={s.lat} onChange={num('lat')} /></label>
            <label>Lng<input type="number" step={0.0001} value={s.lng} onChange={num('lng')} /></label>
          </div>
        </section>
      </aside>

      <main className="views">
        <div className="view">
          <PlanView plot={s.plot} buildable={buildable} footprint={o.footprint} setbacks={s.setbacks} selectedEdge={edge}
            onEdge={setEdge} tracing={tracing} onTrace={p => setTracing(t => [...(t ?? []), p])} underlay={underlay} />
        </div>
        <div className="view">
          <Viewer plot={s.plot} buildable={buildable} footprint={o.footprint} floors={o.floors} floorHeight={s.floorHeight} level={level} sun={sun} />
          <div className="levels">
            <button className={level === null ? 'on' : ''} onClick={() => setLevel(null)}>All</button>
            {Array.from({ length: o.floors }, (_, i) => o.floors - 1 - i).map(i => (
              <button key={i} className={level === i ? 'on' : ''} onClick={() => setLevel(i)}>{i === 0 ? 'G' : i}</button>
            ))}
          </div>
        </div>
      </main>

      <aside className="panel results">
        <div className="tabs">
          {opts.map((x, i) => <button key={x.name} className={i === opt ? 'on' : ''} onClick={() => { setOpt(i); setLevel(null) }}>{x.name}</button>)}
        </div>
        <h2>Area statement</h2>
        <table>
          <tbody>
            <tr><th>Plot area</th><td>{both(o.plotArea)}</td></tr>
            <tr><th>Buildable after setbacks</th><td>{both(o.buildableArea)}</td></tr>
            <tr><th>Footprint</th><td>{both(o.footprintArea)}</td></tr>
            <tr><th>Floors</th><td>{o.floors === 0 ? 'None fit' : `G+${o.floors - 1}`}</td></tr>
            <tr><th>Gross floor area</th><td>{both(o.gfa)}</td></tr>
            <tr><th>Height</th><td>{fmt(o.height)} m</td></tr>
          </tbody>
        </table>
        <h2>Rule checks</h2>
        <table>
          <thead><tr><th>Rule</th><th>Design</th><th>Limit</th><th /></tr></thead>
          <tbody>
            {o.checks.map(c => (
              <tr key={c.name} title={c.source}>
                <th>{c.name}</th>
                <td>{fmt(c.value, 2)}{c.unit}</td>
                <td>{fmt(c.limit, 2)}{c.unit}</td>
                <td><span className={`tag ${c.status}`}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted">All areas are measured from the geometry. Gross floor area assumes every floor uses the full footprint, with no FAR exemptions.</p>
      </aside>
    </div>
  )
}
