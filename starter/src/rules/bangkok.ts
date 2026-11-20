/** Every number the tool applies, with its clause, source and how sure we are. See references/BANGKOK.md. */

export type Basis = 'sourced' | 'secondary' | 'interpretation' | 'assumption'

export interface Ref {
  clause: string
  url: string
  basis: Basis
  note?: string
}

export const SRC = {
  plan: 'https://cpudgiapp.bangkok.go.th/arcgis/rest/services/GI_Platform/BMAGI_Planing/MapServer/1',
  y10: 'https://drive.google.com/file/d/18fi25DtOw0jSB4JhfAClQVLF3kRzA9eP/view',
  mr55: 'https://data.yotathai.org/d/zx9hfz.pdf',
  mr33: 'https://bmc.go.th/wp-content/uploads/2020/06/48_2562.pdf',
  ord55: 'https://so05.tci-thaijo.org/index.php/sarasatr/article/download/272771/183891/1143741',
  parking: 'https://so05.tci-thaijo.org/index.php/sarasatr/article/download/242164/168262/861885',
  eia: 'https://cuir.car.chula.ac.th/dspace/bitstream/123456789/82774/1/6470045425.pdf',
  osm: 'https://www.openstreetmap.org/copyright',
}

/** Clause of the 2556 Bangkok Comprehensive Plan for each zone whose text was read. */
const ZONE_CLAUSE: Record<string, string> = { 'ย.8': 'ข้อ 15', 'ย.9': 'ข้อ 16', 'ย.10': 'ข้อ 17', 'พ.3': 'ข้อ 20', 'พ.4': 'ข้อ 21', 'พ.5': 'ข้อ 22' }

/** The one zone modelled in full (use conditions included). */
export const SCOPE_ZONE = 'ย.10'

export interface Zone {
  code: string // e.g. ย.10
  sub: string // e.g. ย.10 as printed on the layer
  far: number
  osr: number // percent
  law?: string
}

export const zoneRef = (z: Zone, what: string): Ref => ({
  clause: `Bangkok Comprehensive Plan B.E. 2556, ${ZONE_CLAUSE[z.code] ?? 'clause not checked'} (${z.code}) · ${what}`,
  url: z.code === 'ย.10' ? SRC.y10 : z.law || SRC.plan,
  basis: ZONE_CLAUSE[z.code] ? 'sourced' : 'secondary',
})

export const REF = {
  bonus: { clause: 'Plan 2556 ข้อ 53: +FAR ≤ 5 × public open space, max +20%', url: SRC.y10, basis: 'sourced' } as Ref,
  planted: { clause: 'Plan 2556 ข้อ 17: ≥ 50% of open space planted and permeable', url: SRC.y10, basis: 'sourced' } as Ref,
  open30: { clause: 'MR 55 (2543) ข้อ 33(1): residential, ≥ 30% of largest floor', url: SRC.mr55, basis: 'sourced' } as Ref,
  open10: { clause: 'MR 55 (2543) ข้อ 33(2): other buildings, ≥ 10% of largest floor', url: SRC.mr55, basis: 'sourced' } as Ref,
  road: { clause: 'MR 55 (2543) ข้อ 41: setback from road by road width', url: SRC.mr55, basis: 'sourced' } as Ref,
  plane: { clause: 'MR 55 (2543) ข้อ 44: height ≤ 2 × distance to far side of road', url: SRC.mr55, basis: 'sourced' } as Ref,
  side: { clause: 'MR 55 (2543) ข้อ 50: window walls ≥ 2 m (≤ 9 m) / ≥ 3 m (< 23 m) from boundary', url: SRC.mr55, basis: 'sourced' } as Ref,
  fire: {
    clause: 'MR 33 (2535) ข้อ 3: 6 m fire-access road all round a high-rise',
    url: SRC.mr33,
    basis: 'interpretation',
    note: 'Read as ≥ 6 m clear between building and side/rear boundaries; the road side may share the road setback.',
  } as Ref,
  access: { clause: 'MR 33 (2535) ข้อ 2 (am. MR 50): high-rise / ≥ 10,000 m² needs road ≥ 10 m (≥ 18 m if > 30,000 m²)', url: SRC.mr33, basis: 'sourced' } as Ref,
  frontage: { clause: 'MR 33 (2535) ข้อ 2 (am. MR 50): ≥ 12 m of plot boundary on that road', url: SRC.mr33, basis: 'sourced' } as Ref,
  spacing: { clause: 'MR 55 ข้อ 48 (am. MR 61): spacing between buildings on one plot', url: SRC.mr55, basis: 'interpretation', note: '6 m used between towers (shared 6 m fire-access road).' } as Ref,
  parking: { clause: 'MR 7 (2517) + Bangkok Building Control Ordinance 2544: larger of 1 per unit ≥ 60 m² and 1 per 120 m²', url: SRC.parking, basis: 'secondary' } as Ref,
  parkingOther: { clause: '1 space per 120 m² floor area (large-building rate applied to this use)', url: SRC.parking, basis: 'assumption' } as Ref,
  eia: { clause: 'MNRE EIA notification: condo ≥ 80 units or ≥ 4,000 m²', url: SRC.eia, basis: 'secondary' } as Ref,
  useCond: { clause: 'Plan 2556 ข้อ 17: road ≥ 12 m or ≤ 500 m from a mass-transit station', url: SRC.y10, basis: 'sourced' } as Ref,
}

export const HIGH_RISE_M = 23 // MR 33 ข้อ 1
export const XL_M2 = 10_000 // MR 33 ข้อ 1
export const XXL_M2 = 30_000 // MR 33 ข้อ 2
export const ACCESS_ROAD_M = 10
export const ACCESS_ROAD_XXL_M = 18
export const FRONTAGE_M = 12
export const FIRE_ACCESS_M = 6
export const BONUS_CAP = 0.2
export const BONUS_MULT = 5
export const PARKING_M2_PER_SPACE = 120
export const PARKING_UNIT_M2 = 60
export const EIA_UNITS = 80
export const EIA_M2 = 4000
export const STATION_M = 500

/** MR 55 ข้อ 41. Required distance from the road boundary for a road of width w (m). `tall`: > 2 storeys or > 8 m. */
export const roadSetback = (w: number, tall: boolean) => {
  if (w > 20) return 2
  if (w >= 10) return w / 10
  const fromCentre = tall ? 6 : w < 6 ? 3 : 0
  return Math.max(0, fromCentre - w / 2)
}

/** Side/rear boundary distance for a building of height h (m). ข้อ 50 below 23 m; MR 33 ข้อ 3 reading at/above. */
export const sideSetback = (h: number) => (h >= HIGH_RISE_M ? FIRE_ACCESS_M : h > 9 ? 3 : 2)

export type Use = 'condo' | 'office' | 'hotel'

export interface UseSpec {
  label: string
  thai: string
  openShare: number
  openRef: Ref
  unitLabel?: string
}

export const USES: Record<Use, UseSpec> = {
  condo: { label: 'Condominium', thai: 'อาคารอยู่อาศัยรวม', openShare: 0.3, openRef: REF.open30, unitLabel: 'units' },
  hotel: {
    label: 'Hotel',
    thai: 'โรงแรม',
    openShare: 0.1,
    openRef: { ...REF.open10, basis: 'interpretation', note: 'A hotel is not a residential building under MR 55, so the 10% rate is used.' },
    unitLabel: 'rooms',
  },
  office: { label: 'Office', thai: 'อาคารสำนักงาน', openShare: 0.1, openRef: REF.open10 },
}

/** Editable assumptions, shown in the UI as such. */
export interface Assumptions {
  groundH: number
  floorH: number
  roof: number
  efficiency: number
  unitSize: number
  parkingSpace: number
  plate: number
  bonusOpen: number
}

export const ASSUME_DEFAULT: Record<Use, Assumptions> = {
  condo: { groundH: 4.5, floorH: 3.0, roof: 2.0, efficiency: 0.75, unitSize: 35, parkingSpace: 30, plate: 900, bonusOpen: 0 },
  hotel: { groundH: 5.0, floorH: 3.2, roof: 2.0, efficiency: 0.65, unitSize: 32, parkingSpace: 30, plate: 900, bonusOpen: 0 },
  office: { groundH: 5.0, floorH: 4.0, roof: 2.0, efficiency: 0.8, unitSize: 0, parkingSpace: 30, plate: 1200, bonusOpen: 0 },
}

export const ASSUME_LABEL: Record<keyof Assumptions, [string, string]> = {
  groundH: ['Ground floor height', 'm'],
  floorH: ['Typical floor-to-floor', 'm'],
  roof: ['Roof allowance (parapet, lift overrun)', 'm'],
  efficiency: ['Net-to-gross efficiency', ''],
  unitSize: ['Average unit / room (net)', 'm²'],
  parkingSpace: ['Gross area per parking space incl. aisle', 'm²'],
  plate: ['Tower floor plate target', 'm²'],
  bonusOpen: ['Public open space offered (FAR bonus)', 'm²'],
}

/** Rule switches; turning one off shows its effect on the allowed space. */
export interface Flags {
  road: boolean
  side: boolean
  plane: boolean
  access: boolean
  far: boolean
  open: boolean
}

export const FLAGS_ON: Flags = { road: true, side: true, plane: true, access: true, far: true, open: true }

/** Road right-of-way estimate from OSM road class, used only to pre-fill the input. */
export const ROAD_CLASS_M: Record<string, number> = {
  motorway: 40, trunk: 30, primary: 30, secondary: 20, tertiary: 12, unclassified: 8, residential: 8, living_street: 6, service: 6,
}
