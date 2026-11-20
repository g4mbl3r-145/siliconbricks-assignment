import { area } from './geometry'
import { projector, type LL } from './project'

const ringOf = (s: string): LL[] => {
  const pts = s.trim().split(/\s+/).map(t => t.split(',').map(Number)).filter(v => v.length >= 2 && v.every(Number.isFinite)).map(([lng, lat]) => [lng, lat] as LL)
  if (pts.length > 1 && pts[0][0] === pts.at(-1)![0] && pts[0][1] === pts.at(-1)![1]) pts.pop()
  return pts
}

/** Largest polygon outer ring (or closed path) in a KML document. Google Earth Pro "Save Place As… .kml". */
export const parseKml = (text: string): LL[] => {
  const outer = [...text.matchAll(/<outerBoundaryIs>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>/gi)].map(m => ringOf(m[1]))
  const lines = outer.length ? [] : [...text.matchAll(/<(?:LineString|LinearRing)>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>/gi)].map(m => ringOf(m[1]))
  const rings = [...outer, ...lines].filter(r => r.length >= 3)
  if (!rings.length) throw new Error('No polygon found. In Google Earth Pro, draw the plot with Add Polygon, then Save Place As… KML or KMZ.')
  const size = (r: LL[]) => { const p = projector(r[0]); return area(r.map(p.toM)) }
  return rings.sort((a, b) => size(b) - size(a))[0]
}

export const readKmlFile = async (f: File): Promise<LL[]> => {
  if (/\.kmz$/i.test(f.name)) {
    const { unzipSync, strFromU8 } = await import('fflate')
    const files = unzipSync(new Uint8Array(await f.arrayBuffer()))
    const kml = Object.keys(files).find(n => /\.kml$/i.test(n))
    if (!kml) throw new Error('KMZ has no KML inside.')
    return parseKml(strFromU8(files[kml]))
  }
  return parseKml(await f.text())
}

export const toKml = (pts: LL[], name: string) => {
  const c = [...pts, pts[0]].map(([lng, lat]) => `${lng.toFixed(7)},${lat.toFixed(7)},0`).join(' ')
  const esc = name.replace(/[<&>]/g, ch => ({ '<': '&lt;', '&': '&amp;', '>': '&gt;' })[ch]!)
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>${esc}</name><Placemark><name>${esc}</name>
<Style><LineStyle><color>ff00ff00</color><width>2</width></LineStyle><PolyStyle><color>4000ff00</color></PolyStyle></Style>
<Polygon><outerBoundaryIs><LinearRing><coordinates>${c}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Document></kml>`
}
