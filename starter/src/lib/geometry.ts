import pc from 'polygon-clipping'

export type Pt = [number, number]
export type Poly = Pt[]

export const signedArea = (p: Poly) =>
  p.reduce((s, [x1, y1], i) => {
    const [x2, y2] = p[(i + 1) % p.length]
    return s + x1 * y2 - x2 * y1
  }, 0) / 2

export const area = (p: Poly) => Math.abs(signedArea(p))

export const ccw = (p: Poly): Poly => (signedArea(p) < 0 ? [...p].reverse() : p)

export const edgeLengths = (p: Poly) =>
  p.map(([x1, y1], i) => {
    const [x2, y2] = p[(i + 1) % p.length]
    return Math.hypot(x2 - x1, y2 - y1)
  })

export const centroid = (p: Poly): Pt => {
  const a = signedArea(p)
  let cx = 0, cy = 0
  p.forEach(([x1, y1], i) => {
    const [x2, y2] = p[(i + 1) % p.length]
    const f = x1 * y2 - x2 * y1
    cx += (x1 + x2) * f
    cy += (y1 + y2) * f
  })
  return [cx / (6 * a), cy / (6 * a)]
}

const q = (v: number) => Math.round(v * 1e6) / 1e6
const qp = (p: Poly): Poly => p.map(([x, y]) => [q(x), q(y)])

const capsule = ([ax, ay]: Pt, [bx, by]: Pt, r: number, seg = 12): Pt[] => {
  const t = Math.atan2(by - ay, bx - ax)
  const arc = (cx: number, cy: number, from: number) =>
    Array.from({ length: seg + 1 }, (_, i): Pt => {
      const a = from + (Math.PI * i) / seg
      return [q(cx + r * Math.cos(a)), q(cy + r * Math.sin(a))]
    })
  return [...arc(bx, by, t - Math.PI / 2), ...arc(ax, ay, t + Math.PI / 2)]
}

const largest = (mp: pc.MultiPolygon): Poly =>
  mp.reduce<Poly>((best, poly) => {
    const ring = poly[0].slice(0, -1) as Poly
    return area(ring) > area(best) ? ring : best
  }, [])

/** Region at least setbacks[i] from edge i (edge i runs p[i] → p[i+1]). Concave-safe. */
export const inset = (plot: Poly, setbacks: number[]): Poly => {
  const p = ccw(plot)
  const flip = p !== plot
  const sb = flip ? p.map((_, i) => setbacks[(p.length - 2 - i + p.length) % p.length]) : setbacks
  const cuts = p
    .map((a, i) => (sb[i] > 0 ? [capsule(a, p[(i + 1) % p.length], sb[i])] : null))
    .filter(Boolean) as pc.Polygon[]
  return cuts.length ? ccw(largest(pc.difference([qp(p)], pc.union(...(cuts as [pc.Polygon]))))) : p
}

export const scaleAbout = (p: Poly, k: number, [cx, cy] = centroid(p)): Poly =>
  p.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k])

export const clip = (a: Poly, b: Poly): Poly => ccw(largest(pc.intersection([qp(a)], [qp(b)])))

export const rect = (w: number, d: number): Poly => [[0, 0], [w, 0], [w, d], [0, d]]

export const SQFT_PER_M2 = 10.7639
