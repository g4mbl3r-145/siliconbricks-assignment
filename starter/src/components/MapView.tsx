import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import type { GeoJSONSource, MapLayerMouseEvent, MapLayerTouchEvent } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'

maplibregl.setWorkerUrl(workerUrl)
import type { LL } from '../lib/project'

type FC = GeoJSON.FeatureCollection

export interface MapData {
  plot: LL[]
  road: boolean[]
  envelope: FC
  design: FC
  context: FC
  zones: FC | null
}

export interface Show { envelope: boolean; design: boolean; context: boolean; zones: boolean; satellite: boolean }

interface Props {
  data: MapData
  show: Show
  level: number | null
  drawing: boolean
  focus: number // bump to fly to plot
  onPlot: (pts: LL[], kind: 'move' | 'insert' | 'delete' | 'new', at?: number) => void
  onEdge: (i: number) => void
  onDrawEnd: () => void
}

const STYLE = 'https://tiles.openfreemap.org/styles/liberty'
const IMAGERY = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const empty: FC = { type: 'FeatureCollection', features: [] }
const ring = (p: LL[]) => [...p, p[0]]

const USE_COLOR = ['match', ['get', 'use'], 'lobby', '#94a3b8', 'parking', '#64748b', '#f8fafc'] as unknown as maplibregl.ExpressionSpecification

export default function MapView({ data, show, level, drawing, focus, onPlot, onEdge, onDrawEnd }: Props) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const ready = useRef(false)
  const live = useRef({ data, drawing, onPlot, onEdge, onDrawEnd, draft: [] as LL[] })
  live.current = { ...live.current, data, drawing, onPlot, onEdge, onDrawEnd }

  const src = (id: string) => map.current?.getSource(id) as GeoJSONSource | undefined

  const syncPlot = () => {
    const { data: d, drawing: dr, draft } = live.current
    const pts = dr ? draft : d.plot
    const closed = !dr && pts.length > 2
    src('plot')?.setData(closed ? { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring(pts)] } }] } : empty)
    src('edges')?.setData({
      type: 'FeatureCollection',
      features: (closed ? pts : pts.slice(0, -1)).map((a, i) => ({
        type: 'Feature', properties: { i, road: !dr && !!d.road[i] },
        geometry: { type: 'LineString', coordinates: [a, pts[(i + 1) % pts.length]] },
      })),
    })
    src('verts')?.setData({ type: 'FeatureCollection', features: pts.map((c, i) => ({ type: 'Feature', properties: { i }, geometry: { type: 'Point', coordinates: c } })) })
    src('mids')?.setData(closed ? {
      type: 'FeatureCollection',
      features: pts.map((a, i) => {
        const b = pts[(i + 1) % pts.length]
        return { type: 'Feature', properties: { i }, geometry: { type: 'Point', coordinates: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] } }
      }),
    } : empty)
  }

  useEffect(() => {
    const m = new maplibregl.Map({
      container: el.current!, style: STYLE, center: data.plot.length ? data.plot.reduce<[number, number]>(([a, b], [x, y]) => [a + x / data.plot.length, b + y / data.plot.length], [0, 0]) : [100.5713, 13.7326], zoom: 17.6, pitch: 58, bearing: -28,
      maxPitch: 80, attributionControl: { compact: true }, canvasContextAttributes: { antialias: true },
    })
    map.current = m
    ;(window as unknown as { __map: maplibregl.Map }).__map = m // used by browser tests
    m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-left')
    m.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right')
    m.doubleClickZoom.disable()

    m.on('load', () => {
      for (const l of m.getStyle().layers) if ((l as { 'source-layer'?: string })['source-layer'] === 'building') m.setLayoutProperty(l.id, 'visibility', 'none')
      m.addSource('sat', { type: 'raster', tiles: [IMAGERY], tileSize: 256, maxzoom: 19, attribution: 'Imagery © Esri, Maxar, Earthstar Geographics' })
      m.addLayer({ id: 'sat', type: 'raster', source: 'sat', layout: { visibility: 'none' } }, m.getStyle().layers.find(l => l.type === 'symbol')?.id)
      for (const id of ['plot', 'edges', 'verts', 'mids', 'envelope', 'design', 'context', 'zones']) m.addSource(id, { type: 'geojson', data: empty })
      m.addLayer({ id: 'zones-fill', type: 'fill', source: 'zones', layout: { visibility: 'none' }, paint: { 'fill-color': ['match', ['slice', ['get', 'zone'], 0, 1], 'ย', '#a16207', 'พ', '#dc2626', '#2563eb'], 'fill-opacity': 0.12 } })
      m.addLayer({ id: 'zones-line', type: 'line', source: 'zones', layout: { visibility: 'none' }, paint: { 'line-color': '#92400e', 'line-width': 1, 'line-dasharray': [3, 2] } })
      m.addLayer({ id: 'zones-label', type: 'symbol', source: 'zones', layout: { visibility: 'none', 'text-field': ['concat', ['get', 'zone'], '  FAR ', ['to-string', ['get', 'far']]], 'text-size': 12, 'text-font': ['Noto Sans Regular'] }, paint: { 'text-color': '#78350f', 'text-halo-color': '#fff', 'text-halo-width': 1.5 } })
      m.addLayer({ id: 'plot-fill', type: 'fill', source: 'plot', paint: { 'fill-color': '#86efac', 'fill-opacity': 0.45 } })
      m.addLayer({ id: 'context', type: 'fill-extrusion', source: 'context', paint: {
        'fill-extrusion-color': ['match', ['get', 'basis'], 'estimated', '#d6d3d1', '#a8a29e'],
        'fill-extrusion-height': ['get', 'h'], 'fill-extrusion-base': 0, 'fill-extrusion-opacity': 0.9, 'fill-extrusion-vertical-gradient': true,
      } })
      m.addLayer({ id: 'design', type: 'fill-extrusion', source: 'design', paint: {
        'fill-extrusion-color': USE_COLOR, 'fill-extrusion-height': ['get', 'top'], 'fill-extrusion-base': ['get', 'base'], 'fill-extrusion-opacity': 0.97,
      } })
      m.addLayer({ id: 'envelope', type: 'fill-extrusion', source: 'envelope', paint: {
        'fill-extrusion-color': '#f97316', 'fill-extrusion-height': ['get', 'top'], 'fill-extrusion-base': ['get', 'base'], 'fill-extrusion-opacity': 0.22,
      } })
      m.addLayer({ id: 'edges-hit', type: 'line', source: 'edges', paint: { 'line-color': '#000', 'line-opacity': 0, 'line-width': 16 } })
      m.addLayer({ id: 'edges', type: 'line', source: 'edges', layout: { 'line-cap': 'round' }, paint: { 'line-color': ['case', ['get', 'road'], '#dc2626', '#166534'], 'line-width': ['case', ['get', 'road'], 5, 2.5] } })
      m.addLayer({ id: 'mids', type: 'circle', source: 'mids', paint: { 'circle-radius': 4, 'circle-color': '#fff', 'circle-stroke-color': '#166534', 'circle-stroke-width': 1.5, 'circle-opacity': 0.9 } })
      m.addLayer({ id: 'verts', type: 'circle', source: 'verts', paint: { 'circle-radius': 6.5, 'circle-color': '#166534', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } })
      ready.current = true
      setAll()
    })

    let drag: number | null = null
    let raf = 0
    const cur = () => live.current.data.plot.slice()
    const down = (e: MapLayerMouseEvent | MapLayerTouchEvent) => {
      if (live.current.drawing || !e.features?.length) return
      if ('originalEvent' in e && (e.originalEvent as MouseEvent).button === 2) return
      e.preventDefault()
      drag = e.features[0].properties!.i as number
      m.getCanvas().style.cursor = 'grabbing'
    }
    const move = (e: maplibregl.MapMouseEvent | maplibregl.MapTouchEvent) => {
      if (drag === null) return
      const i = drag
      const ll: LL = [e.lngLat.lng, e.lngLat.lat]
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const p = cur()
        p[i] = ll
        live.current.onPlot(p, 'move')
      })
    }
    const up = () => {
      if (drag === null) return
      drag = null
      m.getCanvas().style.cursor = ''
    }
    m.on('mousedown', 'verts', down)
    m.on('touchstart', 'verts', down)
    m.on('mousemove', move)
    m.on('touchmove', move)
    m.on('mouseup', up)
    m.on('touchend', up)
    m.on('contextmenu', 'verts', e => {
      const p = cur()
      if (p.length <= 3) return
      const i = e.features![0].properties!.i as number
      p.splice(i, 1)
      live.current.onPlot(p, 'delete', i)
    })
    m.on('dblclick', 'verts', e => {
      if (live.current.drawing) return
      const p = cur()
      if (p.length <= 3) return
      const i = e.features![0].properties!.i as number
      p.splice(i, 1)
      live.current.onPlot(p, 'delete', i)
    })
    m.on('click', e => {
      const L = live.current
      if (L.drawing) {
        const hitFirst = L.draft.length > 2 && m.queryRenderedFeatures(e.point, { layers: ['verts'] }).some(f => f.properties.i === 0)
        if (hitFirst) { L.onPlot(L.draft, 'new'); L.draft = []; L.onDrawEnd(); return }
        L.draft = [...L.draft, [e.lngLat.lng, e.lngLat.lat]]
        syncPlot()
        return
      }
      const mid = m.queryRenderedFeatures(e.point, { layers: ['mids'] })[0]
      if (mid) {
        const i = mid.properties.i as number
        const p = cur()
        p.splice(i + 1, 0, (mid.geometry as GeoJSON.Point).coordinates as LL)
        L.onPlot(p, 'insert', i)
        return
      }
      if (m.queryRenderedFeatures(e.point, { layers: ['verts'] }).length) return
      const edge = m.queryRenderedFeatures(e.point, { layers: ['edges-hit'] })[0]
      if (edge) L.onEdge(edge.properties.i as number)
    })
    for (const id of ['verts', 'mids', 'edges-hit']) {
      m.on('mouseenter', id, () => { if (drag === null) m.getCanvas().style.cursor = id === 'verts' ? 'grab' : 'pointer' })
      m.on('mouseleave', id, () => { if (drag === null) m.getCanvas().style.cursor = '' })
    }
    const key = (e: KeyboardEvent) => {
      const L = live.current
      if (!L.drawing) return
      if (e.key === 'Enter' && L.draft.length > 2) { L.onPlot(L.draft, 'new'); L.draft = []; L.onDrawEnd() }
      if (e.key === 'Escape') { L.draft = []; L.onDrawEnd(); syncPlot() }
      if (e.key === 'Backspace') { L.draft = L.draft.slice(0, -1); syncPlot() }
    }
    window.addEventListener('keydown', key)
    return () => { window.removeEventListener('keydown', key); m.remove() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sent = useRef<Record<string, unknown>>({})
  const setAll = () => {
    if (!ready.current) return
    const { data: d } = live.current
    syncPlot()
    for (const [id, v] of [['envelope', d.envelope], ['design', d.design], ['context', d.context], ['zones', d.zones ?? empty]] as const) {
      if (sent.current[id] === v) continue // unchanged: skip re-tiling in the worker
      sent.current[id] = v
      src(id)?.setData(v)
    }
  }

  useEffect(setAll, [data])
  useEffect(() => {
    live.current.draft = []
    if (ready.current) syncPlot()
    if (map.current) map.current.getCanvas().style.cursor = drawing ? 'crosshair' : ''
  }, [drawing])

  useEffect(() => {
    const m = map.current
    if (!m || !ready.current) return
    const vis = (id: string, on: boolean) => m.getLayer(id) && m.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none')
    vis('envelope', show.envelope)
    vis('design', show.design)
    vis('context', show.context)
    vis('sat', show.satellite)
    for (const id of ['zones-fill', 'zones-line', 'zones-label']) vis(id, show.zones)
  }, [show, data])

  useEffect(() => {
    const m = map.current
    if (!m || !ready.current) return
    m.setPaintProperty('design', 'fill-extrusion-color', level === null ? USE_COLOR : ['case', ['==', ['get', 'level'], level], '#2563eb', ['>', ['get', 'level'], level], '#e2e8f0', USE_COLOR])
    m.setPaintProperty('design', 'fill-extrusion-opacity', level === null ? 0.97 : 0.75)
    m.setFilter('envelope', level === null ? null : ['all', ['<=', ['get', 'base'], (data.design.features.find((f: GeoJSON.Feature) => f.properties?.level === level)?.properties?.base ?? 0) + 0.01], ['>', ['get', 'top'], (data.design.features.find((f: GeoJSON.Feature) => f.properties?.level === level)?.properties?.base ?? 0) + 0.01]])
  }, [level, data])

  useEffect(() => {
    const m = map.current
    const p = live.current.data.plot
    if (!m || !focus || !p.length) return
    const xs = p.map(v => v[0]), ys = p.map(v => v[1])
    m.fitBounds([[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]], { padding: 160, pitch: 58, bearing: m.getBearing(), maxZoom: 18, duration: 900 })
  }, [focus])

  return <div ref={el} className="map" />
}
