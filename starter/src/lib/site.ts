import { area, edgeLengths, pointInPoly, type Poly, type Pt } from './geometry'
import { projector, type LL } from './project'
import { ROAD_CLASS_M, SRC, type Zone } from '../rules/bangkok'

export interface RawBuilding { id: number; g: LL[]; h?: string; l?: string; t?: string; n?: string }
export interface RawRoad { id: number; g: LL[]; k: string; w?: string; ln?: string; n?: string }
export interface Context { bbox: [number, number, number, number]; source: string; fetched: string; buildings: RawBuilding[]; roads: RawRoad[]; stations: { name: string; c: LL }[] }

export type HeightBasis = 'osm-height' | 'osm-levels' | 'estimated'

const num = (s?: string) => {
  const v = parseFloat((s ?? '').replace(',', '.'))
  return Number.isFinite(v) && v > 0 ? v : null
}

const LEVEL_M = 3.2 // assumption: storey height for OSM building:levels
/** Height of a context building and how it was obtained. Estimates are labelled in the UI. */
export const buildingHeight = (b: RawBuilding, footprintM2: number): [number, HeightBasis] => {
  const h = num(b.h)
  // OpenMapTiles render_height falls back to 5 m when OSM has no height or levels: treat that as unknown
  if (h && !(b.t === 'tiles' && h <= 5)) return [h, b.t === 'tiles' ? 'osm-levels' : 'osm-height']
  const l = num(b.l)
  if (l) return [l * LEVEL_M, 'osm-levels']
  if (b.t === 'house' || b.t === 'terrace' || b.t === 'detached') return [7, 'estimated']
  return [footprintM2 < 150 ? 9 : footprintM2 < 600 ? 13 : 20, 'estimated']
}

const inBox = ([lng, lat]: LL, [w, s, e, n]: number[]) => lng >= w && lng <= e && lat >= s && lat <= n

/** Ids of context buildings standing on the plot (assumed to be cleared). */
export const onPlot = (ctx: Context | null, plot: LL[]): number[] => {
  if (!ctx || plot.length < 3) return []
  const pr = projector(plot[0])
  const plotM = plot.map(pr.toM)
  const [mx, Mx, my, My] = [Math.min(...plotM.map(p => p[0])), Math.max(...plotM.map(p => p[0])), Math.min(...plotM.map(p => p[1])), Math.max(...plotM.map(p => p[1]))]
  return ctx.buildings
    .filter(b => {
      const m = b.g.slice(0, -1).map(pr.toM)
      if (m.every(([x]) => x < mx) || m.every(([x]) => x > Mx) || m.every(([, y]) => y < my) || m.every(([, y]) => y > My)) return false
      return m.some(v => pointInPoly(v, plotM)) || plotM.some(v => pointInPoly(v, m))
    })
    .map(b => b.id)
}

export const contextGeoJSON = (ctx: Context | null, skip: Set<number>): GeoJSON.FeatureCollection => {
  if (!ctx?.buildings.length) return { type: 'FeatureCollection', features: [] }
  const pr = projector(ctx.buildings[0].g[0])
  return {
    type: 'FeatureCollection',
    features: ctx.buildings
      .filter(b => !skip.has(b.id) && b.g.length > 3)
      .map(b => {
        const [h, basis] = buildingHeight(b, area(b.g.slice(0, -1).map(pr.toM)))
        return { type: 'Feature', properties: { h, basis, n: b.n ?? '' }, geometry: { type: 'Polygon', coordinates: [b.g] } }
      }),
  }
}

export const roadWidthEstimate = (r: RawRoad): [number, string] => {
  const w = num(r.w)
  if (w) return [w, 'OSM width tag']
  return [ROAD_CLASS_M[r.k] ?? 8, `estimate from OSM road class “${r.k}”`]
}

export interface RoadGuess { road: boolean[]; width: number; basis: string; name: string }

/** Mark plot edges that run along a mapped road; take the widest such road (MR 55 ข้อ 46). */
export const detectRoad = (ctx: Context | null, plot: LL[]): RoadGuess => {
  const none: RoadGuess = { road: plot.map((_, i) => i === 0), width: 8, basis: 'no mapped road found nearby; edge 1 assumed', name: '' }
  if (!ctx) return none
  const pr = projector(plot[0])
  const P = plot.map(pr.toM)
  const lens = edgeLengths(P)
  const segs = ctx.roads.flatMap(r => {
    const g = r.g.map(pr.toM)
    if (!g.some(([x, y]) => Math.abs(x) < 400 && Math.abs(y) < 400)) return []
    const [w] = roadWidthEstimate(r)
    return g.slice(1).map((b, i) => ({ a: g[i], b, r, w }))
  })
  const best = P.map((a, i) => {
    const b = P[(i + 1) % P.length]
    const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    const [ux, uy] = [(b[0] - a[0]) / lens[i], (b[1] - a[1]) / lens[i]]
    let hit: (typeof segs)[number] | null = null
    let hd = Infinity
    for (const s of segs) {
      const [dx, dy] = [s.b[0] - s.a[0], s.b[1] - s.a[1]]
      const l = Math.hypot(dx, dy)
      if (l < 1e-6 || Math.abs((ux * dx + uy * dy) / l) < 0.85) continue
      const t = Math.max(0, Math.min(1, ((mid[0] - s.a[0]) * dx + (mid[1] - s.a[1]) * dy) / (l * l)))
      const d = Math.hypot(mid[0] - s.a[0] - t * dx, mid[1] - s.a[1] - t * dy)
      if (d <= s.w / 2 + 8 && d < hd) { hd = d; hit = s }
    }
    return hit
  })
  if (!best.some(Boolean)) return none
  const top = best.filter(Boolean).sort((a, b) => b!.w - a!.w)[0]!
  const [width, basis] = roadWidthEstimate(top.r)
  return { road: best.map(Boolean), width, basis, name: top.r.n ?? top.r.k }
}

export const nearestStation = (ctx: Context | null, at: LL): { name: string; m: number } | null => {
  if (!ctx?.stations.length) return null
  const pr = projector(at)
  return ctx.stations.map(s => ({ name: s.name, m: Math.hypot(...pr.toM(s.c)) })).sort((a, b) => a.m - b.m)[0]
}

const TH = '๐๑๒๓๔๕๖๗๘๙'
const thaiDigits = (s: string) => s.replace(/[๐-๙]/g, d => String(TH.indexOf(d)))
/** "ย.10-7" → "ย.10" */
const baseCode = (s: string) => thaiDigits(s).replace(/-\d+$/, '').trim()

export interface ZoneFC { features: { properties: { zone: string; far: number; osr: number; law?: string }; geometry: { type: string; coordinates: number[][][] | number[][][][] } }[] }

export const zoneAt = (fc: ZoneFC | null, at: LL): Zone | null => {
  if (!fc) return null
  const pr = projector(at)
  for (const f of fc.features) {
    const polys = (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates) as LL[][][]
    if (polys.some(p => pointInPoly([0, 0], p[0].map(pr.toM) as Poly))) {
      const p = f.properties
      return { code: baseCode(p.zone), sub: thaiDigits(p.zone), far: p.far, osr: p.osr, law: p.law }
    }
  }
  return null
}

/** Live lookup on the BMA layer for plots outside the bundled zone extract. */
export const fetchZone = async ([lng, lat]: LL): Promise<Zone | null> => {
  const u = `${SRC.plan}/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=LUP_ZONE,LUP_FAR,LUP_OSR,LAW_URL&returnGeometry=false&f=json`
  const j = await (await fetch(u)).json()
  const a = j.features?.[0]?.attributes
  return a ? { code: baseCode(a.LUP_ZONE), sub: thaiDigits(a.LUP_ZONE), far: a.LUP_FAR, osr: a.LUP_OSR, law: a.LAW_URL } : null
}

const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']

/** Live OSM context around a point (used outside the bundled snapshot). */
const parse = (d: { osm3s?: { timestamp_osm_base?: string }; elements: { type: string; id: number; tags?: Record<string, string>; lon: number; lat: number; geometry: { lon: number; lat: number }[] }[] }, bbox: Context['bbox']): Context => {
  const ctx: Context = { bbox, source: 'OpenStreetMap contributors via Overpass API (ODbL)', fetched: d.osm3s?.timestamp_osm_base ?? '', buildings: [], roads: [], stations: [] }
  for (const el of d.elements) {
    const t = el.tags ?? {}
    if (el.type === 'node') { ctx.stations.push({ name: t['name:en'] ?? t.name ?? 'station', c: [el.lon, el.lat] }); continue }
    const g: LL[] = el.geometry.map(p => [p.lon, p.lat])
    if (t.building) ctx.buildings.push({ id: el.id, g, h: t.height, l: t['building:levels'], t: t.building, n: t['name:en'] ?? t.name })
    else ctx.roads.push({ id: el.id, g, k: t.highway, w: t.width, ln: t.lanes, n: t['name:en'] ?? t.name })
  }
  return ctx
}

/** Live OSM context around a point (used outside the bundled snapshot). Mirrors are raced; the first good answer wins. */
export const fetchContext = async ([lng, lat]: LL, r = 0.0035, timeoutMs = 45_000): Promise<Context> => {
  const [s, w, n, e] = [lat - r, lng - r, lat + r, lng + r].map(v => v.toFixed(5))
  const q = `[out:json][timeout:40];(way["building"](${s},${w},${n},${e});way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|living_street)$"](${s},${w},${n},${e});node["railway"="station"](${(lat - 0.01).toFixed(5)},${(lng - 0.01).toFixed(5)},${(lat + 0.01).toFixed(5)},${(lng + 0.01).toFixed(5)}););out tags geom;`
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), timeoutMs)
  try {
    const d = await Promise.any(OVERPASS.map(async url => {
      const res = await fetch(url, { method: 'POST', body: new URLSearchParams({ data: q }), signal: ctl.signal })
      if (!res.ok) throw new Error(`${url} ${res.status}`)
      return res.json()
    }))
    return parse(d, [+w, +s, +e, +n])
  } finally {
    clearTimeout(timer)
    ctl.abort()
  }
}

type TileFeature = { geometry: GeoJSON.Geometry; properties: Record<string, unknown> }
const TILE_ROAD: Record<string, string> = { minor: 'residential', service: 'service', motorway: 'motorway', trunk: 'trunk', primary: 'primary', secondary: 'secondary', tertiary: 'tertiary' }

/** Context from the OpenMapTiles vector tiles already loaded for the basemap (OSM data, CDN-served, always available). */
export const tilesContext = (bbox: Context['bbox'], buildings: TileFeature[], roads: TileFeature[], pois: TileFeature[]): Context => {
  const polys = (g: GeoJSON.Geometry): LL[][] => (g.type === 'Polygon' ? [g.coordinates[0] as LL[]] : g.type === 'MultiPolygon' ? g.coordinates.map(p => p[0] as LL[]) : [])
  const lines = (g: GeoJSON.Geometry): LL[][] => (g.type === 'LineString' ? [g.coordinates as LL[]] : g.type === 'MultiLineString' ? (g.coordinates as LL[][]) : [])
  let id = -1
  return {
    bbox,
    source: 'OpenStreetMap contributors via OpenMapTiles vector tiles (OpenFreeMap)',
    fetched: '',
    buildings: buildings.flatMap(f => (f.properties.hide_3d ? [] : polys(f.geometry).filter(r => r.length > 3).map(g => ({ id: id--, g, h: String(f.properties.render_height ?? ''), t: 'tiles' })))),
    roads: roads.flatMap(f => {
      const k = TILE_ROAD[String(f.properties.class)]
      return k ? lines(f.geometry).filter(g => g.length > 1).map(g => ({ id: id--, g, k, n: (f.properties['name:en'] ?? f.properties.name) as string | undefined })) : []
    }),
    stations: pois.filter(f => f.properties.class === 'railway' && f.geometry.type === 'Point').map(f => ({ name: String(f.properties['name:en'] ?? f.properties.name ?? 'station'), c: (f.geometry as GeoJSON.Point).coordinates as LL })),
  }
}

export const covers = (ctx: Context | null, at: LL) => !!ctx && inBox(at, [ctx.bbox[0] + 0.0015, ctx.bbox[1] + 0.0015, ctx.bbox[2] - 0.0015, ctx.bbox[3] - 0.0015])

/** Thai land units: 1 rai = 4 ngan = 400 sq wah = 1,600 m². */
export const rai = (m2: number) => {
  const wah = m2 / 4
  const r = Math.floor(wah / 400)
  const ng = Math.floor((wah - r * 400) / 100)
  return `${r}-${ng}-${(wah - r * 400 - ng * 100).toFixed(1)} rai`
}
