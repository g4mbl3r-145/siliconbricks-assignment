import type { MouseEvent } from 'react'
import { edgeLengths, signedArea, type Poly, type Pt } from '../lib/geometry'

export interface Underlay { url: string; width: number; height: number; mPerPx: number }

interface Props {
  plot: Poly
  buildable: Poly
  footprint: Poly
  setbacks: number[]
  selectedEdge: number | null
  onEdge: (i: number) => void
  tracing: Pt[] | null
  onTrace: (p: Pt) => void
  underlay: Underlay | null
}

const path = (p: Poly) => (p.length ? `M${p.map(([x, y]) => `${x},${-y}`).join('L')}Z` : '')

export default function PlanView({ plot, buildable, footprint, setbacks, selectedEdge, onEdge, tracing, onTrace, underlay }: Props) {
  const pts = [...plot, ...(tracing ?? [])]
  const uw = underlay ? underlay.width * underlay.mPerPx : 0
  const uh = underlay ? underlay.height * underlay.mPerPx : 0
  const xs = [...pts.map(p => p[0]), ...(underlay ? [0, uw] : [])]
  const ys = [...pts.map(p => -p[1]), ...(underlay ? [-uh, 0] : [])]
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const m = Math.max(x1 - x0, y1 - y0) * 0.12 + 1
  const vb = [x0 - m, y0 - m, x1 - x0 + 2 * m, y1 - y0 + 2 * m]
  const fs = vb[2] / 40
  const lens = edgeLengths(plot)
  const ccwPlot = signedArea(plot) > 0

  const click = (e: MouseEvent<SVGSVGElement>) => {
    if (!tracing) return
    const svg = e.currentTarget
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()!.inverse())
    onTrace([Math.round(pt.x * 100) / 100, Math.round(-pt.y * 100) / 100])
  }

  return (
    <svg viewBox={vb.join(' ')} onClick={click} className={tracing ? 'plan tracing' : 'plan'} role="img" aria-label="Site plan">
      {underlay && <image href={underlay.url} x={0} y={-uh} width={uw} height={uh} opacity={0.6} />}
      <path d={path(plot)} fill="#c9d8b6" stroke="#3b4a3a" strokeWidth={fs / 6} />
      <path d={path(buildable)} fill="none" stroke="#b45309" strokeWidth={fs / 8} strokeDasharray={`${fs / 2} ${fs / 3}`} />
      <path d={path(footprint)} fill="#2563eb" fillOpacity={0.35} stroke="#1d4ed8" strokeWidth={fs / 8} />
      {!tracing &&
        plot.map(([ax, ay], i) => {
          const [bx, by] = plot[(i + 1) % plot.length]
          const k = (fs * 0.9 * (ccwPlot ? 1 : -1)) / Math.hypot(bx - ax, by - ay)
          const [mx, my] = [(ax + bx) / 2 + (by - ay) * k, (ay + by) / 2 - (bx - ax) * k]
          return (
            <g key={i} onClick={() => onEdge(i)} className="edge">
              <line x1={ax} y1={-ay} x2={bx} y2={-by} stroke={selectedEdge === i ? '#dc2626' : 'transparent'} strokeWidth={fs / 2} />
              <text x={mx} y={-my} fontSize={fs} textAnchor="middle" dominantBaseline="middle">
                E{i + 1} · {lens[i].toFixed(1)} m · sb {setbacks[i] ?? 0}
              </text>
            </g>
          )
        })}
      {tracing && (
        <>
          <polyline points={tracing.map(([x, y]) => `${x},${-y}`).join(' ')} fill="none" stroke="#dc2626" strokeWidth={fs / 6} />
          {tracing.map(([x, y], i) => <circle key={i} cx={x} cy={-y} r={fs / 3} fill="#dc2626" />)}
        </>
      )}
      <g transform={`translate(${vb[0] + vb[2] - fs * 2},${vb[1] + fs * 2})`}>
        <path d={`M0,${-fs} L${fs / 2},${fs / 2} L0,0 L${-fs / 2},${fs / 2}Z`} fill="#111" />
        <text y={fs * 1.6} fontSize={fs} textAnchor="middle">N</text>
      </g>
    </svg>
  )
}
