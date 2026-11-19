import { area, clip, inset, scaleAbout, type Poly } from './geometry'

export type Status = 'pass' | 'check' | 'fail'

export interface Rules {
  far: number
  maxCoverage: number
  maxHeight: number
  floorHeight: number
  setbacks: number[]
  source: string
}

export interface Check {
  name: string
  value: number
  limit: number
  unit: string
  status: Status
  source: string
}

export interface Option {
  name: string
  footprint: Poly
  floors: number
  plotArea: number
  buildableArea: number
  footprintArea: number
  gfa: number
  far: number
  coverage: number
  height: number
  checks: Check[]
}

const EPS = 1e-6
const down = (x: number) => Math.floor(x + EPS)

const check = (name: string, value: number, limit: number, unit: string, source: string, tol = 0.02): Check => ({
  name, value, limit, unit, source,
  status: value <= limit * (1 + EPS) ? 'pass' : value <= limit * (1 + tol) ? 'check' : 'fail',
})

const fit = (buildable: Poly, target: number): Poly => {
  const a = area(buildable)
  return target >= a ? buildable : clip(scaleAbout(buildable, Math.sqrt(target / a)), buildable)
}

export const makeOption = (name: string, plot: Poly, r: Rules, footprintTarget = Infinity): Option => {
  const plotArea = area(plot)
  const buildable = inset(plot, r.setbacks)
  const buildableArea = area(buildable)
  const footprint = fit(buildable, Math.min(footprintTarget, r.maxCoverage * plotArea))
  const footprintArea = area(footprint)
  const floors = footprintArea
    ? Math.max(0, Math.min(down(r.maxHeight / r.floorHeight), down((r.far * plotArea) / footprintArea)))
    : 0
  const gfa = floors * footprintArea
  const height = floors * r.floorHeight
  const far = gfa / plotArea
  const coverage = footprintArea / plotArea
  return {
    name, footprint, floors, plotArea, buildableArea, footprintArea, gfa, far, coverage, height,
    checks: [
      check('FAR', far, r.far, '', r.source),
      check('Ground coverage', coverage * 100, r.maxCoverage * 100, '%', r.source),
      check('Height', height, r.maxHeight, 'm', r.source),
    ],
  }
}

export const options = (plot: Poly, r: Rules): Option[] => {
  const maxFloors = down(r.maxHeight / r.floorHeight)
  const tower = (r.far * area(plot)) / Math.max(1, maxFloors)
  return [makeOption('A · Max coverage', plot, r), makeOption('B · Tower', plot, r, tower)]
}
