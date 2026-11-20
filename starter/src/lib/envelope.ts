import { area, cut, edgeLengths, type Poly } from './geometry'
import { ACCESS_ROAD_M, FRONTAGE_M, HIGH_RISE_M, roadSetback, sideSetback, type Assumptions, type Flags } from '../rules/bangkok'

export interface Site {
  plot: Poly // local metres
  road: boolean[] // per edge: faces the public road
  width: number // road right-of-way width (m)
}

export interface Level {
  i: number
  base: number
  top: number
  poly: Poly
  area: number
  roadSb: number // distance from road boundary applied at this level
}

export interface Envelope {
  regime: 'low' | 'high'
  sideSb: number
  roadSb: number // ข้อ 41 setback (before the height plane)
  levels: Level[]
  height: number // top of last level (m)
}

export const MIN_LEVEL_M2 = 30
const MAX_LEVELS = 120

/** Longest single road-facing edge (m). */
export const frontage = (s: Site) => Math.max(0, ...edgeLengths(s.plot).filter((_, i) => s.road[i]))

export const accessOk = (s: Site) => s.road.some(Boolean) && s.width >= ACCESS_ROAD_M && frontage(s) >= FRONTAGE_M

export const levelTop = (i: number, a: Assumptions) => (i === 0 ? a.groundH : a.groundH + i * a.floorH)

/**
 * Space the building may occupy, floor by floor.
 * low: height (incl. roof allowance) stays below 23 m, so ข้อ 50 side setbacks apply.
 * high: high-rise side setback (fire access) and height plane (ข้อ 44) until nothing is left.
 */
export const envelope = (s: Site, a: Assumptions, f: Flags, regime: 'low' | 'high'): Envelope => {
  const hasRoad = s.road.some(Boolean)
  const sideSb = f.side ? sideSetback(regime === 'high' ? HIGH_RISE_M : HIGH_RISE_M - 0.01) : 0
  const roadSb = f.road && hasRoad ? roadSetback(s.width, true) : 0
  const sides = cut(s.plot, s.plot, s.road.map(r => (r ? 0 : sideSb)))
  const cache = new Map<number, Poly>()
  const at = (d: number) => {
    const k = Math.round(d * 100) / 100
    if (!cache.has(k)) cache.set(k, k > 0 ? cut(sides, s.plot, s.road.map(r => (r ? k : 0)), s.road) : sides)
    return cache.get(k)!
  }
  const levels: Level[] = []
  for (let i = 0; i < MAX_LEVELS; i++) {
    const base = i === 0 ? 0 : levelTop(i - 1, a)
    const top = levelTop(i, a)
    if (regime === 'low' && top + a.roof >= HIGH_RISE_M) break
    const plane = f.plane && hasRoad ? (top + a.roof) / 2 - s.width : 0
    const d = Math.max(roadSb, plane)
    const poly = at(d)
    const ar = poly.length ? area(poly) : 0
    if (ar < MIN_LEVEL_M2) break
    levels.push({ i, base, top, poly, area: ar, roadSb: d })
  }
  return { regime, sideSb, roadSb, levels, height: levels.at(-1)?.top ?? 0 }
}
