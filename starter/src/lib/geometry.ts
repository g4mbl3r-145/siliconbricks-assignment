import pc from 'polygon-clipping'

export type Pt = [number, number]
export type Poly = Pt[]

export const signedArea = (p: Poly) =>
  p.reduce((s, [x1, y1], i) => {
    const [x2, y2] = p[(i + 1) % p.length]
    return s + x1 * y2 - x2 * y1
  }, 0) / 2

export const area = (p: Poly) => Math.abs(signedArea(p))
export const areaAll = (ps: Poly[]) => ps.reduce((s, p) => s + area(p), 0)

export const ccw = (p: Poly): Poly => (signedArea(p) < 0 ? [...p].reverse() : p)

export const edgeLengths = (p: Poly) =>
  p.map(([x1, y1], i) => {
    const [x2, y2] = p[(i + 1) % p.length]
    return Math.hypot(x2 - x1, y2 - y1)
  })

export const centroid = (p: Poly): Pt => {
  const a = signedArea(p)
  if (Math.abs(a) < 1e-9) return p.reduce<Pt>(([x, y], [px, py]) => [x + px / p.length, y + py / p.length], [0, 0])
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

/** Points within r of segment ab (distance-to-segment band). */
const capsule = ([ax, ay]: Pt, [bx, by]: Pt, r0: number, seg = 12): Poly => {
  const r = r0 / Math.cos(Math.PI / (2 * seg)) // circumscribe: chords never fall inside r0
  const t = Math.atan2(by - ay, bx - ax)
  const arc = (cx: number, cy: number, from: number) =>
    Array.from({ length: seg + 1 }, (_, i): Pt => {
      const a = from + (Math.PI * i) / seg
      return [q(cx + r * Math.cos(a)), q(cy + r * Math.sin(a))]
    })
  return [...arc(bx, by, t - Math.PI / 2), ...arc(ax, ay, t + Math.PI / 2)]
}

/** Points within r of the infinite line through ab (distance-to-road-line band), limited to ±L along it. */
const slab = ([ax, ay]: Pt, [bx, by]: Pt, r: number, L = 2000): Poly => {
  const l = Math.hypot(bx - ax, by - ay)
  const [ux, uy] = [(bx - ax) / l, (by - ay) / l]
  const [nx, ny] = [-uy * r, ux * r]
  const [sx, sy, ex, ey] = [ax - ux * L, ay - uy * L, bx + ux * L, by + uy * L]
  return qp([[sx - nx, sy - ny], [ex - nx, ey - ny], [ex + nx, ey + ny], [sx + nx, sy + ny]])
}

const rings = (mp: pc.MultiPolygon, min = 1): Poly[] =>
  mp.map(poly => ccw(poly[0].slice(0, -1) as Poly)).filter(r => area(r) >= min).sort((a, b) => area(b) - area(a))

const largest = (mp: pc.MultiPolygon): Poly => rings(mp, 0)[0] ?? []

/** polygon-clipping can throw on near-degenerate input; treat that as an empty result (never over-reports space). */
const safe = <T,>(f: () => T, fallback: T): T => {
  try {
    return f()
  } catch {
    return fallback
  }
}

/**
 * Region of `base` at least setbacks[i] from edge i of `plot` (edge i runs plot[i] → plot[i+1]).
 * Edges flagged `line` are measured to their infinite line (road boundary), others to the segment.
 * Concave-safe. Returns the largest remaining piece.
 */
export const cut = (base: Poly, plot: Poly, setbacks: number[], line: boolean[] = []): Poly => {
  if (base.length < 3) return []
  const bands = plot
    .map((a, i) => {
      const r = setbacks[i] ?? 0
      if (r <= 0) return null
      const b = plot[(i + 1) % plot.length]
      return [line[i] ? slab(a, b, r) : capsule(a, b, r)] as pc.Polygon
    })
    .filter(Boolean) as pc.Polygon[]
  return bands.length ? safe(() => largest(pc.difference([qp(base)], ...(bands as [pc.Polygon]))), []) : ccw(base)
}

export const inset = (plot: Poly, setbacks: number[], line: boolean[] = []) => cut(plot, plot, setbacks, line)

export const scaleAbout = (p: Poly, k: number, [cx, cy] = centroid(p)): Poly =>
  p.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k])

export const clip = (a: Poly, b: Poly): Poly => (a.length < 3 || b.length < 3 ? [] : safe(() => largest(pc.intersection([qp(a)], [qp(b)])), []))

export const union = (ps: Poly[]): Poly[] => {
  const g = ps.filter(p => p.length > 2).map(p => [qp(p)] as pc.Polygon)
  return g.length ? safe(() => rings(pc.union(g[0], ...g.slice(1))), ps) : []
}

/** Half-plane (as a big polygon) of points with (p - o)·n >= 0. */
export const halfPlane = ([ox, oy]: Pt, [nx, ny]: Pt, L = 5000): Poly => {
  const [tx, ty] = [-ny, nx]
  return [[ox + tx * L, oy + ty * L], [ox - tx * L, oy - ty * L], [ox - tx * L + nx * L, oy - ty * L + ny * L], [ox + tx * L + nx * L, oy + ty * L + ny * L]]
}

/** Largest scaled copy of `region` about its centroid (clipped back into it) with area ≤ target. */
export const fit = (region: Poly, target: number): Poly => {
  if (region.length < 3 || target <= 0) return []
  if (area(region) <= target) return region
  const c = centroid(region)
  let [lo, hi] = [0, 1]
  let best: Poly = []
  for (let k = 0; k < 24; k++) {
    const m = (lo + hi) / 2
    const p = clip(scaleAbout(region, m, c), region)
    if (area(p) <= target) { lo = m; best = p } else hi = m
    if (best.length && area(best) > target * 0.995) break
  }
  return best
}

const ptSeg = ([px, py]: Pt, [ax, ay]: Pt, [bx, by]: Pt) => {
  const [dx, dy] = [bx - ax, by - ay]
  const l2 = dx * dx + dy * dy
  const t = l2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)) : 0
  return Math.hypot(px - ax - t * dx, py - ay - t * dy)
}

const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

const segsCross = (a: Pt, b: Pt, c: Pt, d: Pt) => {
  const [d1, d2, d3, d4] = [cross(c, d, a), cross(c, d, b), cross(a, b, c), cross(a, b, d)]
  return d1 * d2 < 0 && d3 * d4 < 0
}

export const segSeg = (a: Pt, b: Pt, c: Pt, d: Pt) =>
  segsCross(a, b, c, d) ? 0 : Math.min(ptSeg(a, c, d), ptSeg(b, c, d), ptSeg(c, a, b), ptSeg(d, a, b))

/** Minimum distance from polygon outline to segment ab. */
export const polySegDist = (p: Poly, a: Pt, b: Pt) =>
  p.reduce((m, v, i) => Math.min(m, segSeg(v, p[(i + 1) % p.length], a, b)), Infinity)

/** Minimum distance from polygon to the infinite line through ab. */
export const polyLineDist = (p: Poly, [ax, ay]: Pt, [bx, by]: Pt) => {
  const l = Math.hypot(bx - ax, by - ay)
  return p.reduce((m, [x, y]) => Math.min(m, Math.abs((bx - ax) * (ay - y) - (ax - x) * (by - ay)) / l), Infinity)
}

/** True if any two non-adjacent edges cross, or any edge has zero length. */
export const selfIntersects = (p: Poly) => {
  const n = p.length
  for (let i = 0; i < n; i++) {
    const [a, b] = [p[i], p[(i + 1) % n]]
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 1e-6) return true
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue
      if (segsCross(a, b, p[j], p[(j + 1) % n])) return true
    }
  }
  return false
}

export const pointInPoly = ([x, y]: Pt, p: Poly) => {
  let c = false
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i], [xj, yj] = p[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}
