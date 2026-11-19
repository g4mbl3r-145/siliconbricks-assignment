import { getPosition } from 'suncalc'

const R = Math.PI / 180

/** Unit vector toward the sun in scene axes: +x east, +y up, +z south. suncalc v2: degrees, azimuth clockwise from north. */
export const sunDir = (date: Date, lat: number, lng: number): [number, number, number] => {
  const p = getPosition(date, lat, lng)
  const az = p.azimuth * R, alt = p.altitude * R
  return [Math.sin(az) * Math.cos(alt), Math.sin(alt), -Math.cos(az) * Math.cos(alt)]
}
