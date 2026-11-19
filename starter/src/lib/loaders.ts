import DxfParser from 'dxf-parser'
import * as pdfjs from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { Pt } from './geometry'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

export interface Polyline { layer: string; closed: boolean; pts: Pt[] }

/** Renders one PDF page to a PNG data URL for use as a tracing underlay. */
export const pdfPageImage = async (file: File, page = 1, scale = 2) => {
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  const pg = await doc.getPage(page)
  const vp = pg.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = vp.width
  canvas.height = vp.height
  await pg.render({ canvas, viewport: vp }).promise
  return { url: canvas.toDataURL('image/png'), width: vp.width, height: vp.height, pages: doc.numPages }
}

export const fileImage = (file: File) =>
  new Promise<{ url: string; width: number; height: number }>((res, rej) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => res({ url, width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = rej
    img.src = url
  })

/** Lines and polylines from a DXF, grouped by layer, in drawing units. */
export const dxfPolylines = (text: string): Polyline[] => {
  const dxf = new DxfParser().parseSync(text)
  return (dxf?.entities ?? []).flatMap((e: any): Polyline[] =>
    e.type === 'LINE' || e.type === 'LWPOLYLINE' || e.type === 'POLYLINE'
      ? [{ layer: e.layer ?? '0', closed: !!e.shape, pts: e.vertices.map((v: any): Pt => [v.x, v.y]) }]
      : [],
  )
}
