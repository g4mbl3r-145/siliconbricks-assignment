import { describe, expect, it } from 'vitest'
import { area, centroid, inset, rect, type Poly } from './geometry'
import { makeOption, options, type Rules } from './massing'
import { sunDir } from './sun'

const rules: Rules = { far: 2, maxCoverage: 0.5, maxHeight: 15, floorHeight: 3, setbacks: [3, 3, 3, 3], source: 'test' }

describe('geometry', () => {
  it('area and centroid of a rectangle', () => {
    expect(area(rect(30, 40))).toBe(1200)
    expect(centroid(rect(30, 40))).toEqual([15, 20])
  })

  it('uniform inset of a rectangle is exact', () => {
    expect(area(inset(rect(30, 40), [3, 3, 3, 3]))).toBeCloseTo(24 * 34, 6)
  })

  it('per-edge setbacks: front 6, others 3', () => {
    expect(area(inset(rect(30, 40), [6, 3, 3, 3]))).toBeCloseTo(24 * 31, 6)
  })

  it('clockwise input keeps setbacks on the right edges', () => {
    const cw = [...rect(30, 40)].reverse() as Poly
    expect(area(inset(cw, [3, 3, 6, 3]))).toBeCloseTo(24 * 31, 6)
  })

  it('L-shaped (concave) plot stays inside and loses area', () => {
    const L: Poly = [[0, 0], [40, 0], [40, 20], [20, 20], [20, 40], [0, 40]]
    const b = inset(L, Array(6).fill(2))
    expect(area(b)).toBeLessThan(area(L))
    expect(area(b)).toBeGreaterThan(0)
    b.forEach(([x, y]) => {
      expect(x >= 1.99 && y >= 1.99 && x <= 38.01 && y <= 38.01).toBe(true)
      expect(x <= 18.01 || y <= 18.01 || Math.hypot(x - 20, y - 20) >= 1.99).toBe(true)
      expect(x > 20 && y > 20).toBe(false)
    })
  })
})

describe('massing', () => {
  it('coverage-limited option', () => {
    const o = makeOption('A', rect(30, 40), rules)
    expect(o.buildableArea).toBeCloseTo(816, 6)
    expect(o.footprintArea).toBeCloseTo(600, 3)
    expect(o.floors).toBe(4)
    expect(o.far).toBeCloseTo(2, 3)
    expect(o.checks.every(c => c.status === 'pass')).toBe(true)
  })

  it('height-limited tower uses all floors', () => {
    const [, b] = options(rect(30, 40), rules)
    expect(b.floors).toBe(5)
    expect(b.height).toBe(15)
    expect(b.gfa).toBeLessThanOrEqual(2400 * (1 + 1e-6))
    expect(b.checks.every(c => c.status === 'pass')).toBe(true)
  })

  it('setbacks too large leave no building', () => {
    const o = makeOption('X', rect(10, 10), { ...rules, setbacks: [6, 6, 6, 6] })
    expect(o.floors).toBe(0)
  })
})

describe('sun', () => {
  it('is high and southward at noon in Bengaluru in December', () => {
    const [x, y, z] = sunDir(new Date('2026-12-21T06:40:00Z'), 12.97, 77.59)
    expect(y).toBeGreaterThan(0.8)
    expect(z).toBeGreaterThan(0)
    expect(Math.hypot(x, y, z)).toBeCloseTo(1, 6)
  })
})
