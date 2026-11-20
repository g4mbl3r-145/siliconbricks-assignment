import { edgeLengths, signedArea, type Poly } from '../lib/geometry'

interface Props {
  plot: Poly
  road: boolean[]
  ground: Poly // allowed space at ground level
  level: Poly // allowed space at the shown level
  floor: Poly[] // design floor at the shown level
  label: string
}

const path = (p: Poly) => (p.length > 2 ? `M${p.map(([x, y]) => `${x.toFixed(2)},${(-y).toFixed(2)}`).join('L')}Z` : '')

export default function PlanView({ plot, road, ground, level, floor, label }: Props) {
  if (plot.length < 3) return null
  const xs = plot.map(p => p[0]), ys = plot.map(p => -p[1])
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const m = Math.max(x1 - x0, y1 - y0) * 0.16 + 2
  const vb = [x0 - m, y0 - m, x1 - x0 + 2 * m, y1 - y0 + 2 * m]
  const fs = Math.max(vb[2], vb[3]) / 34
  const lens = edgeLengths(plot)
  const sgn = signedArea(plot) > 0 ? 1 : -1
  const bar = [5, 10, 20, 50].find(v => v > vb[2] / 6) ?? 50

  return (
    <svg viewBox={vb.join(' ')} className="plan" role="img" aria-label={`Site plan, ${label}`}>
      <path d={path(plot)} fill="#dcfce7" stroke="#166534" strokeWidth={fs / 7} />
      <path d={path(ground)} fill="none" stroke="#f97316" strokeWidth={fs / 9} strokeDasharray={`${fs / 2} ${fs / 3}`} />
      {level !== ground && <path d={path(level)} fill="#f97316" fillOpacity={0.12} stroke="#ea580c" strokeWidth={fs / 9} />}
      {floor.map((f, i) => <path key={i} d={path(f)} fill="#2563eb" fillOpacity={0.4} stroke="#1d4ed8" strokeWidth={fs / 8} />)}
      {plot.map(([ax, ay], i) => {
        const [bx, by] = plot[(i + 1) % plot.length]
        const k = (fs * 0.95 * sgn) / Math.hypot(bx - ax, by - ay)
        const [mx, my] = [(ax + bx) / 2 + (by - ay) * k, (ay + by) / 2 - (bx - ax) * k]
        return (
          <g key={i}>
            {road[i] && <line x1={ax} y1={-ay} x2={bx} y2={-by} stroke="#dc2626" strokeWidth={fs / 3} strokeLinecap="round" />}
            <text x={mx} y={-my} fontSize={fs * 0.8} textAnchor="middle" dominantBaseline="middle" fill={road[i] ? '#b91c1c' : '#1f2937'}>
              {lens[i].toFixed(1)}
            </text>
          </g>
        )
      })}
      <g transform={`translate(${vb[0] + vb[2] - fs * 1.6},${vb[1] + fs * 1.8})`}>
        <path d={`M0,${-fs} L${fs / 2},${fs / 2} L0,0 L${-fs / 2},${fs / 2}Z`} fill="#111" />
        <text y={fs * 1.6} fontSize={fs * 0.9} textAnchor="middle">N</text>
      </g>
      <g transform={`translate(${vb[0] + fs},${vb[1] + vb[3] - fs})`}>
        <rect width={bar} height={fs / 4} fill="#111" />
        <text x={bar / 2} y={-fs / 3} fontSize={fs * 0.75} textAnchor="middle">{bar} m</text>
      </g>
      <text x={vb[0] + fs} y={vb[1] + fs * 1.4} fontSize={fs * 0.85} fill="#334155">{label}</text>
    </svg>
  )
}
