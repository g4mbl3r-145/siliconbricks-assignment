import type { Pt } from './geometry'

export type LL = [number, number] // [lng, lat]

/** Local tangent-plane projection (metres, +x east, +y north) about an origin. Error < 0.01% within 2 km. */
export const projector = ([lng0, lat0]: LL) => {
  const f = (lat0 * Math.PI) / 180
  const my = 111132.92 - 559.82 * Math.cos(2 * f) + 1.175 * Math.cos(4 * f)
  const mx = 111412.84 * Math.cos(f) - 93.5 * Math.cos(3 * f)
  return {
    toM: ([lng, lat]: LL): Pt => [(lng - lng0) * mx, (lat - lat0) * my],
    toLL: ([x, y]: Pt): LL => [lng0 + x / mx, lat0 + y / my],
  }
}

export const meanLL = (ps: LL[]): LL => ps.reduce<LL>(([a, b], [x, y]) => [a + x / ps.length, b + y / ps.length], [0, 0])
