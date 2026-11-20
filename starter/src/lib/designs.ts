import { area, areaAll, centroid, clip, edgeLengths, fit, halfPlane, polyLineDist, polySegDist, union, type Poly, type Pt } from './geometry'
import { accessOk, envelope, frontage, MIN_LEVEL_M2, type Envelope, type Site } from './envelope'
import {
  ACCESS_ROAD_M, ACCESS_ROAD_XXL_M, BONUS_CAP, BONUS_MULT, EIA_M2, EIA_UNITS, FIRE_ACCESS_M, FRONTAGE_M, HIGH_RISE_M,
  PARKING_M2_PER_SPACE, PARKING_UNIT_M2, REF, SCOPE_ZONE, STATION_M, USES, XL_M2, XXL_M2, roadSetback, sideSetback, zoneRef,
  type Assumptions, type Flags, type Ref, type Use, type Zone,
} from '../rules/bangkok'

export type Status = 'pass' | 'check' | 'fail'
export type FloorUse = 'lobby' | 'parking' | 'main'

export interface Floor {
  i: number
  base: number
  top: number
  polys: Poly[]
  area: number
  use: FloorUse
}

export interface Check {
  id: string
  name: string
  value: string
  limit: string
  status: Status
  ref: Ref
  note?: string
}

export interface Design {
  key: string
  name: string
  blurb: string
  regime: 'low' | 'high'
  floors: Floor[]
  gfa: number
  mainArea: number
  parkingArea: number
  net: number
  units: number
  spacesReq: number
  spacesProv: number
  height: number // incl. roof allowance
  cover: number
  open: number
  far: number
  footprint: Poly[]
  checks: Check[]
  error?: string
}

export interface Ctx {
  site: Site
  zone: Zone
  use: Use
  a: Assumptions
  f: Flags
  stationM: number | null
}

export interface Result {
  plotArea: number
  farBase: number
  farEff: number
  maxGfa: number
  access: boolean
  envLow: Envelope
  envHigh: Envelope
  designs: Design[]
}

const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0)
const f0 = (v: number) => Math.round(v).toLocaleString('en-US')
const f1 = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })
const f2 = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
const ok = (c: boolean): Status => (c ? 'pass' : 'fail')
const EPS = 1e-6

/** Split region into two pieces either side of a gap across its longest direction. */
const split = (region: Poly, dir: Pt, gap: number): Poly[] => {
  const c = centroid(region)
  const [ux, uy] = dir
  return [
    clip(region, halfPlane([c[0] + (ux * gap) / 2, c[1] + (uy * gap) / 2], [ux, uy])),
    clip(region, halfPlane([c[0] - (ux * gap) / 2, c[1] - (uy * gap) / 2], [-ux, -uy])),
  ].filter(p => p.length && area(p) >= MIN_LEVEL_M2)
}

const longestDir = (p: Poly): Pt => {
  const ls = edgeLengths(p)
  const i = ls.indexOf(Math.max(...ls))
  const [a, b] = [p[i], p[(i + 1) % p.length]]
  return [(b[0] - a[0]) / ls[i], (b[1] - a[1]) / ls[i]]
}

type Mode = 'tower' | 'twin' | 'slab' | 'blocks'

const META: Record<Mode, [string, string]> = {
  tower: ['Tower on podium', 'Parking podium filling the allowed space, one slender tower set inside the height plane.'],
  twin: ['Twin towers', 'Shared podium, two towers 6 m apart: smaller floor plates, more corner units.'],
  slab: ['Low-rise slab', 'Under 23 m, so high-rise access rules do not apply. Full floor plates.'],
  blocks: ['Twin low-rise blocks', 'Two blocks under 23 m with a 6 m courtyard between them.'],
}

/** Build a stack: lobby, `p` parking floors, then main-use floors, inside `env`, capped at maxGfa. */
const stack = (ctx: Ctx, env: Envelope, mode: Mode, p: number, cover: number, maxGfa: number): Floor[] => {
  const L = env.levels
  if (L.length < 2) return []
  const podium = fit(L[0].poly, cover)
  if (!podium.length) return []
  const floors: Floor[] = []
  let g = 0
  const push = (i: number, polys: Poly[], use: FloorUse) => {
    const ps = polys.filter(x => x.length > 2 && area(x) >= MIN_LEVEL_M2)
    if (!ps.length) return false
    let a = areaAll(ps)
    if (g + a > maxGfa + EPS) {
      const left = maxGfa - g
      if (left < MIN_LEVEL_M2 * ps.length) return false
      const scaled = ps.map(x => fit(x, (area(x) * left) / a)).filter(x => x.length)
      if (!scaled.length) return false
      ps.splice(0, ps.length, ...scaled)
      a = areaAll(ps)
    }
    floors.push({ i, base: L[i].base, top: L[i].top, polys: ps, area: a, use })
    g += a
    return true
  }
  const towers = mode === 'tower' || mode === 'twin'
  const twin = mode === 'twin' || mode === 'blocks'
  const podLevels = towers ? Math.min(p + 1, L.length) : 1
  for (let i = 0; i < podLevels; i++) if (!push(i, [clip(podium, L[i].poly)], i === 0 ? 'lobby' : 'parking')) return floors
  if (podLevels >= L.length) return floors
  const region = clip(podium, L[podLevels].poly)
  const dir = longestDir(region.length ? region : podium)
  let plates: Poly[] = twin ? split(region, dir, FIRE_ACCESS_M) : [region]
  if (towers) plates = plates.map(x => fit(x, twin ? ctx.a.plate * 0.6 : ctx.a.plate)).filter(x => x.length)
  if (!plates.length) return floors
  for (let i = podLevels; i < L.length; i++) {
    const use: FloorUse = !towers && i <= p ? 'parking' : 'main'
    if (!push(i, plates.map(x => clip(x, L[i].poly)), use)) break
  }
  return floors
}

const MAX_PARK = 14

const evalDesign = (ctx: Ctx, r: Omit<Result, 'designs'>, env: Envelope, mode: Mode): Design => {
  const { a, use } = ctx
  const spec = USES[use]
  const plotA = r.plotArea
  const reqOpenExtra = a.bonusOpen
  const capG = !r.access && ctx.f.access ? Math.min(r.maxGfa, XL_M2 - 1) : r.maxGfa
  let cover = Math.max(0, (plotA - reqOpenExtra) / (ctx.f.open ? 1 + spec.openShare : 1))
  let best: Floor[] = []
  const enough = (fl: Floor[]) => {
    const main = sum(fl.filter(f => f.use === 'main').map(f => f.area))
    const park = sum(fl.filter(f => f.use === 'parking').map(f => f.area))
    return !main || park / a.parkingSpace >= spacesRequired(ctx, main)
  }
  for (let iter = 0; iter < 4; iter++) {
    // first guess of parking floors from the GFA cap, then step to the smallest count that suffices
    const g0 = Math.min(capG, sum(env.levels.map(l => Math.min(l.area, cover))))
    let p = Math.max(0, Math.min(MAX_PARK, Math.ceil(((g0 / PARKING_M2_PER_SPACE) * a.parkingSpace) / Math.max(cover, 1)) - 1))
    let floors = stack(ctx, env, mode, p, cover, capG)
    if (enough(floors)) {
      while (p > 0) {
        const fewer = stack(ctx, env, mode, p - 1, cover, capG)
        if (!enough(fewer)) break
        p--
        floors = fewer
      }
    } else {
      while (p < MAX_PARK && !enough(floors)) floors = stack(ctx, env, mode, ++p, cover, capG)
    }
    best = floors
    if (!ctx.f.open) break
    const g = sum(floors.map(f => f.area))
    const largest = Math.max(0, ...floors.map(f => f.area))
    const need = Math.max((ctx.zone.osr / 100) * g, spec.openShare * largest) + reqOpenExtra
    const coverNow = floors.length ? floors[0].area : 0
    if (plotA - coverNow >= need - EPS) break
    cover = Math.max(0, plotA - need) * 0.995
  }
  return finish(ctx, r, env, mode, best)
}

const spacesRequired = (ctx: Ctx, main: number) => {
  if (ctx.use !== 'condo') return Math.ceil(main / PARKING_M2_PER_SPACE)
  const units = ctx.a.unitSize > 0 ? Math.floor((main * ctx.a.efficiency) / ctx.a.unitSize) : 0
  return Math.max(ctx.a.unitSize >= PARKING_UNIT_M2 ? units : 0, Math.ceil(main / PARKING_M2_PER_SPACE))
}

const finish = (ctx: Ctx, r: Omit<Result, 'designs'>, env: Envelope, mode: Mode, floors: Floor[]): Design => {
  const { site, a, use, zone } = ctx
  const spec = USES[use]
  const [name, blurb] = META[mode]
  const plotA = r.plotArea
  const gfa = sum(floors.map(f => f.area))
  const mainArea = sum(floors.filter(f => f.use === 'main').map(f => f.area))
  const parkingArea = sum(floors.filter(f => f.use === 'parking').map(f => f.area))
  const net = mainArea * a.efficiency
  const units = spec.unitLabel && a.unitSize > 0 ? Math.floor(net / a.unitSize) : 0
  const spacesReq = spacesRequired(ctx, mainArea)
  const spacesProv = Math.floor(parkingArea / a.parkingSpace)
  const top = floors.at(-1)?.top ?? 0
  const height = floors.length ? top + a.roof : 0
  const footprint = union(floors.flatMap(f => f.polys))
  const cover = areaAll(footprint)
  const open = plotA - cover
  const largest = Math.max(0, ...floors.map(f => f.area))
  const high = height >= HIGH_RISE_M
  const xl = gfa >= XL_M2
  const roadIdx = site.road.map((x, i) => (x ? i : -1)).filter(i => i >= 0)
  const sideIdx = site.road.map((x, i) => (x ? -1 : i)).filter(i => i >= 0)
  const P = site.plot
  const seg = (i: number): [Pt, Pt] => [P[i], P[(i + 1) % P.length]]
  const polys = floors.flatMap(f => f.polys.map(poly => ({ poly, f })))

  const checks: Check[] = []
  const add = (c: Check) => checks.push(c)

  if (!floors.length) {
    return { key: mode, name, blurb, regime: env.regime, floors, gfa: 0, mainArea: 0, parkingArea: 0, net: 0, units: 0, spacesReq: 0, spacesProv: 0, height: 0, cover: 0, open: plotA, far: 0, footprint: [], checks, error: 'Nothing fits: the allowed space is too small for this design.' }
  }

  add({ id: 'far', name: 'Floor area ratio (FAR)', value: f2(gfa / plotA), limit: `≤ ${f2(r.farEff)}`, status: ok(gfa / plotA <= r.farEff + EPS), ref: zoneRef(zone, `FAR ${zone.far}:1`), note: r.farEff > r.farBase ? `Includes +${f2(r.farEff - r.farBase)} bonus (ข้อ 53).` : undefined })
  add({ id: 'osr', name: 'Open space ratio (OSR)', value: `${f1((open / gfa) * 100)}%`, limit: `≥ ${zone.osr}%`, status: ok(open / gfa >= zone.osr / 100 - EPS), ref: zoneRef(zone, `OSR ${zone.osr}%`), note: `Open space ${f0(open)} m² of total floor area ${f0(gfa)} m².` })
  add({ id: 'open', name: `Open space ≥ ${spec.openShare * 100}% of largest floor`, value: `${f0(open)} m²`, limit: `≥ ${f0(spec.openShare * largest + a.bonusOpen)} m²`, status: ok(open >= spec.openShare * largest + a.bonusOpen - EPS), ref: spec.openRef, note: a.bonusOpen ? 'Limit includes the public open space offered for the bonus.' : undefined })
  add({ id: 'planted', name: 'Planted, permeable open space', value: `${f0(open * 0.5)} m² to plant`, limit: '≥ 50% of open space', status: 'check', ref: REF.planted, note: 'Landscape design must show it; not drawn at concept stage.' })

  if (!roadIdx.length) {
    add({ id: 'roadside', name: 'Road frontage', value: 'none marked', limit: 'plot must face a public road', status: 'fail', ref: REF.road, note: 'Click a plot edge on the map to mark it as road frontage.' })
  } else {
    const reqRoad = roadSetback(site.width, height > 8 || floors.length > 2)
    const dRoad = Math.min(...polys.flatMap(({ poly }) => roadIdx.map(i => polyLineDist(poly, ...seg(i)))))
    add({ id: 'road', name: 'Setback from road boundary', value: `${f1(dRoad)} m`, limit: `≥ ${f1(reqRoad)} m`, status: ok(dRoad >= reqRoad - 0.05), ref: REF.road, note: `Road right-of-way ${f1(site.width)} m.` })
    let worst = { ex: -Infinity, h: 0, lim: 0 }
    for (const { poly, f } of polys) {
      const d = Math.min(...roadIdx.map(i => polyLineDist(poly, ...seg(i))))
      const h = f.top + (f === floors.at(-1) ? a.roof : 0)
      const lim = 2 * (site.width + d)
      if (h - lim > worst.ex) worst = { ex: h - lim, h, lim }
    }
    add({ id: 'plane', name: 'Height vs road width', value: `${f1(worst.h)} m`, limit: `≤ ${f1(worst.lim)} m at that point`, status: ok(worst.ex <= 0.05), ref: REF.plane, note: 'Worst floor: height against 2 × distance to the far side of the road.' })
  }

  const reqSide = sideSetback(height)
  if (sideIdx.length) {
    const dSide = Math.min(...polys.flatMap(({ poly }) => sideIdx.map(i => polySegDist(poly, ...seg(i)))))
    add({ id: 'side', name: 'Side and rear setbacks', value: `${f1(dSide)} m`, limit: `≥ ${f1(reqSide)} m`, status: ok(dSide >= reqSide - 0.05), ref: high ? REF.fire : REF.side, note: high ? REF.fire.note : undefined })
  }

  if (high || xl) {
    const need = gfa > XXL_M2 ? ACCESS_ROAD_XXL_M : ACCESS_ROAD_M
    const why = [high && `height ${f1(height)} m ≥ 23 m`, xl && `floor area ≥ 10,000 m²`].filter(Boolean).join(', ')
    add({ id: 'access', name: 'Road width for high-rise / extra-large', value: `${f1(site.width)} m`, limit: `≥ ${need} m`, status: ok(roadIdx.length > 0 && site.width >= need), ref: REF.access, note: `Applies because ${why}. Width must hold all the way to a road of the same width.` })
    add({ id: 'frontage', name: 'Frontage on that road', value: `${f1(frontage(site))} m`, limit: `≥ ${FRONTAGE_M} m`, status: ok(frontage(site) >= FRONTAGE_M), ref: REF.frontage })
  } else {
    add({ id: 'access', name: 'High-rise / extra-large rules', value: `${f1(height)} m, ${f0(gfa)} m²`, limit: '< 23 m and < 10,000 m²', status: 'pass', ref: REF.access, note: 'Not triggered.' })
  }

  if (zone.code === SCOPE_ZONE) {
    const trig = use === 'hotel' ? units > 80 : use === 'office' ? gfa > XL_M2 : false
    if (trig) {
      const near = ctx.stationM !== null && ctx.stationM <= STATION_M
      add({ id: 'use', name: `${spec.label} size condition`, value: `road ${f1(site.width)} m · station ${ctx.stationM === null ? 'unknown' : `${f0(ctx.stationM)} m`}`, limit: `road ≥ 12 m or station ≤ ${STATION_M} m`, status: ok(site.width >= 12 || near), ref: REF.useCond, note: use === 'hotel' ? 'Hotels over 80 rooms.' : 'Offices over 10,000 m².' })
    } else {
      add({ id: 'use', name: `${spec.label} permitted in ${zone.code}`, value: 'yes', limit: 'not in prohibited list', status: 'pass', ref: zoneRef(zone, 'permitted uses') })
    }
  } else {
    add({ id: 'use', name: `Use conditions in ${zone.code}`, value: 'not modelled', limit: '—', status: 'check', ref: zoneRef(zone, 'permitted uses'), note: `Only ${SCOPE_ZONE} use conditions are modelled.` })
  }

  add({ id: 'parking', name: 'Parking spaces', value: f0(spacesProv), limit: `≥ ${f0(spacesReq)}`, status: ok(spacesProv >= spacesReq), ref: use === 'condo' ? REF.parking : REF.parkingOther, note: `Parking floors ${f0(parkingArea)} m² at ${a.parkingSpace} m² per space (assumption).` })

  if (use === 'condo') {
    const eia = units >= EIA_UNITS || gfa >= EIA_M2
    add({ id: 'eia', name: 'Environmental impact assessment', value: `${f0(units)} units, ${f0(gfa)} m²`, limit: `< ${EIA_UNITS} units and < ${f0(EIA_M2)} m²`, status: eia ? 'check' : 'pass', ref: REF.eia, note: eia ? 'EIA report must be approved before construction.' : undefined })
  }

  return { key: mode, name, blurb, regime: env.regime, floors, gfa, mainArea, parkingArea, net, units, spacesReq, spacesProv, height, cover, open, far: gfa / plotA, footprint, checks }
}

export const analyse = (ctx: Ctx): Result => {
  const { site, zone, a, f } = ctx
  const plotArea = area(site.plot)
  const farBase = zone.far
  const bonus = Math.min(BONUS_MULT * a.bonusOpen, BONUS_CAP * farBase * plotArea) / plotArea
  const farEff = farBase + bonus
  const maxGfa = f.far ? farEff * plotArea : Infinity
  const access = !f.access || accessOk(site)
  const envLow = envelope(site, a, f, 'low')
  const envHigh = envelope(site, a, f, 'high')
  const r = { plotArea, farBase, farEff, maxGfa, access, envLow, envHigh }
  const modes: [Mode, Envelope][] = access
    ? [['tower', envHigh], ['twin', envHigh], ['slab', envLow]]
    : [['slab', envLow], ['blocks', envLow], ['tower', envHigh]]
  return { ...r, designs: modes.map(([m, e]) => evalDesign(ctx, r, e, m)) }
}
