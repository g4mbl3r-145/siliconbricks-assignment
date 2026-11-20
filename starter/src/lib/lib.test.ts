import { describe, expect, it } from 'vitest'
import { area, centroid, fit, inset, pointInPoly, polyLineDist, polySegDist, selfIntersects, type Poly } from './geometry'
import { projector } from './project'
import { envelope, type Site } from './envelope'
import { analyse, type Ctx } from './designs'
import { ASSUME_DEFAULT, FLAGS_ON, roadSetback, sideSetback, type Zone } from '../rules/bangkok'

const rect = (w: number, d: number): Poly => [[0, 0], [w, 0], [w, d], [0, d]]
const L: Poly = [[0, 0], [40, 0], [40, 20], [20, 20], [20, 40], [0, 40]]
const Y10: Zone = { code: 'ย.10', sub: 'ย.10-7', far: 8, osr: 4 }
const ctx = (site: Site, over: Partial<Ctx> = {}): Ctx => ({ site, zone: Y10, use: 'condo', a: ASSUME_DEFAULT.condo, f: FLAGS_ON, stationM: 300, ...over })

describe('geometry', () => {
  it('area and centroid of a rectangle', () => {
    expect(area(rect(30, 40))).toBe(1200)
    expect(centroid(rect(30, 40))).toEqual([15, 20])
  })
  it('per-edge inset on a concave plot stays inside and away from each edge', () => {
    const p = inset(L, [6, 3, 3, 3, 3, 3])
    expect(p.length).toBeGreaterThan(2)
    for (const v of p) expect(pointInPoly(v, L) || L.some(w => w[0] === v[0] && w[1] === v[1])).toBe(true)
    expect(polySegDist(p, L[0], L[1])).toBeGreaterThanOrEqual(6 - 1e-6)
    expect(polySegDist(p, L[2], L[3])).toBeGreaterThanOrEqual(3 - 1e-6)
  })
  it('road edge is measured to its infinite line, not the segment', () => {
    const p: Poly = [[0, 0], [20, 0], [40, 30], [0, 30]] // road edge 0→20, plot extends beyond it
    const r = inset(p, [10, 0, 0, 0], [true])
    expect(polyLineDist(r, [0, 0], [20, 0])).toBeGreaterThanOrEqual(10 - 1e-6)
  })
  it('fit hits the target area within 1% on a concave plot', () => {
    const f = fit(L, 600)
    expect(area(f)).toBeLessThanOrEqual(600)
    expect(area(f)).toBeGreaterThan(594)
  })
  it('detects self-intersection', () => {
    expect(selfIntersects([[0, 0], [10, 10], [10, 0], [0, 10]])).toBe(true)
    expect(selfIntersects(L)).toBe(false)
  })
  it('projection round-trips and measures ~1 m', () => {
    const pr = projector([100.5713, 13.7326])
    const [lng, lat] = pr.toLL([123.4, -56.7])
    const [x, y] = pr.toM([lng, lat])
    expect(x).toBeCloseTo(123.4, 6)
    expect(y).toBeCloseTo(-56.7, 6)
    expect(pr.toM([100.5713, 13.7326 + 1 / 110_600])[1]).toBeCloseTo(1, 1)
  })
})

describe('rules', () => {
  it('MR 55 ข้อ 41 road setback bands', () => {
    expect(roadSetback(4, false)).toBe(1) // 3 m from centreline
    expect(roadSetback(8, true)).toBe(2) // 6 m from centreline
    expect(roadSetback(8, false)).toBe(0)
    expect(roadSetback(12, true)).toBeCloseTo(1.2) // 1/10 of width
    expect(roadSetback(30, true)).toBe(2)
  })
  it('side setback by height', () => {
    expect(sideSetback(8)).toBe(2)
    expect(sideSetback(20)).toBe(3)
    expect(sideSetback(23)).toBe(6)
  })
})

describe('envelope', () => {
  const site: Site = { plot: rect(60, 50), road: [true, false, false, false], width: 12 }
  it('steps back from the road as it rises (ข้อ 44)', () => {
    const e = envelope(site, ASSUME_DEFAULT.condo, FLAGS_ON, 'high')
    const lv = e.levels
    expect(lv.length).toBeGreaterThan(5)
    for (const l of lv) {
      const d = polyLineDist(l.poly, [0, 0], [60, 0])
      expect(l.top + 2).toBeLessThanOrEqual(2 * (12 + d) + 1e-6)
    }
    expect(lv.at(-1)!.area).toBeLessThan(lv[0].area)
  })
  it('turning off the height plane keeps every level the same', () => {
    const e = envelope(site, ASSUME_DEFAULT.condo, { ...FLAGS_ON, plane: false }, 'high')
    expect(new Set(e.levels.slice(0, 20).map(l => Math.round(l.area))).size).toBe(1)
  })
  it('low regime stays below 23 m including roof', () => {
    const e = envelope(site, ASSUME_DEFAULT.condo, FLAGS_ON, 'low')
    expect(e.height + 2).toBeLessThan(23)
  })
})

describe('designs', () => {
  const site: Site = { plot: L.map(([x, y]) => [x * 1.5, y * 1.5]), road: [true, false, false, false, false, false], width: 12 }
  const r = analyse(ctx(site))
  it('produces at least two designs, and floor areas add up', () => {
    expect(r.designs.length).toBeGreaterThanOrEqual(2)
    for (const d of r.designs) {
      expect(d.floors.reduce((s, f) => s + f.area, 0)).toBeCloseTo(d.gfa, 6)
      expect(d.mainArea + d.parkingArea + (d.floors[0]?.area ?? 0)).toBeCloseTo(d.gfa, 6)
      expect(d.far).toBeCloseTo(d.gfa / r.plotArea, 9)
    }
  })
  it('every generated design passes FAR, OSR, open space, setbacks and height plane', () => {
    for (const d of r.designs.filter(x => !x.error)) {
      for (const id of ['far', 'osr', 'open', 'road', 'plane', 'side']) {
        expect(d.checks.find(c => c.id === id)?.status, `${d.name} ${id}`).toBe('pass')
      }
    }
  })
  it('narrow road: high-rise access fails, low-rise designs lead and pass', () => {
    const n = analyse(ctx({ ...site, width: 8 }))
    expect(n.access).toBe(false)
    expect(n.designs[0].regime).toBe('low')
    expect(n.designs[0].checks.every(c => c.status !== 'fail')).toBe(true)
    expect(n.designs[0].gfa).toBeLessThan(10_000)
    const tower = n.designs.find(d => d.key === 'tower')!
    expect(tower.checks.find(c => c.id === 'access')?.status).toBe('fail')
  })
  it('no road frontage fails', () => {
    const n = analyse(ctx({ ...site, road: site.road.map(() => false) }))
    expect(n.designs[0].checks.find(c => c.id === 'roadside')?.status).toBe('fail')
  })
})

describe('kml', async () => {
  const { parseKml, toKml } = await import('./kml')
  const pts: [number, number][] = [[100.571, 13.732], [100.5715, 13.732], [100.5715, 13.7325], [100.571, 13.7325]]
  it('round-trips a polygon through KML', () => {
    expect(parseKml(toKml(pts, 'Plot <A&B>'))).toEqual(pts)
  })
  it('reads Google Earth Pro output with altitude and picks the largest polygon', () => {
    const ge = `<kml><Document><Placemark><Polygon><outerBoundaryIs><LinearRing><coordinates>
      100.1,13.1,0 100.1001,13.1,0 100.1001,13.1001,0 100.1,13.1,0</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>
      <Placemark><Polygon><outerBoundaryIs><LinearRing><coordinates>100.571,13.732,0 100.5715,13.732,0 100.5715,13.7325,0 100.571,13.7325,0 100.571,13.732,0</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Document></kml>`
    expect(parseKml(ge)).toEqual(pts)
  })
  it('rejects a file with no polygon', () => {
    expect(() => parseKml('<kml><Placemark><Point><coordinates>100,13,0</coordinates></Point></Placemark></kml>')).toThrow()
  })
})
