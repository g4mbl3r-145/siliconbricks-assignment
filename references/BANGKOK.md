# Bangkok rules for a condo on a ย.10 plot

Research date: 20 Nov 2026. Confidence: H = read in the regulation text or an official layer; M = secondary source; U = unverified.

## Plan in force
- Bangkok Comprehensive Plan, Ministerial Regulation B.E. 2556 (2013), effective 16 May 2013. Still in force (H). The 4th-revision draft finished its 90-day public posting on 9 Nov 2026 and is expected to take effect around late 2027; its zone codes differ from the current ones (for example, draft ย.10 = FAR 5.5, OSR 7.5%). Sources: nationthailand.com/business/property/40073336, thansettakij.com/real-estate/661177
- Official zoning layer: https://cpudgiapp.bangkok.go.th/arcgis/rest/services/GI_Platform/BMAGI_Planing/MapServer/1. Fields: LUP_ZONE, LUP_FAR, LUP_OSR, LAW_URL. Coordinates are EPSG:32647; request `outSR=4326` for WGS84.

## Zone ย.10 (brown, high-density residential), ข้อ 17 (H)
| Rule | Value | Source |
|---|---|---|
| FAR | 8 : 1 | ข้อ 17, https://drive.google.com/file/d/18fi25DtOw0jSB4JhfAClQVLF3kRzA9eP/view |
| OSR (open space ÷ total floor area) | ≥ 4% | ข้อ 17 |
| Planted, permeable open space | ≥ 50% of the open space | ข้อ 17 |
| Condo (อาคารอยู่อาศัยรวม) size or road conditions | none | ข้อ 17 prohibited-use list |
| FAR bonus | up to +20%; extra floor area ≤ 5× the public open space provided | ข้อ 53 |

Other zones for reference: ย.8 FAR 6 / OSR 5% (ข้อ 15), ย.9 7 / 4.5% (ข้อ 16), พ.4 8 / 4% (ข้อ 21), พ.5 10 / 3% (ข้อ 22). For ย.9 and พ.3 the GIS layer and the legal text disagree; the legal text is used.

## Building Control Act B.E. 2522: ministerial regulations
| Rule | Value | Clause | Conf. |
|---|---|---|---|
| Open space, residential building | ≥ 30% of the largest floor area | MR 55 ข้อ 33(1) | H |
| What counts as open space | no roof over it; includes pools and outdoor parking; structures ≤ 1.20 m high count | MR 55 ข้อ 1 | H |
| Road setback, road < 6 m | ≥ 3 m from road centreline | MR 55 ข้อ 41 | H |
| Road setback, building > 2 storeys or > 8 m, road < 10 m | ≥ 6 m from road centreline | MR 55 ข้อ 41(1) | H |
| Road setback, road 10–20 m | ≥ 1/10 of road width from road boundary | MR 55 ข้อ 41(2) | H |
| Road setback, road > 20 m | ≥ 2 m from road boundary | MR 55 ข้อ 41(3) | H |
| Height plane | height at any point ≤ 2 × horizontal distance to the far boundary of the nearest public road | MR 55 ข้อ 44 | H |
| Height measured | from road or ground level to the highest point (for ข้อ 44) | MR 55 ข้อ 44 ¶2 | H |
| Two roads or a corner plot | use the wider road (conditions: ≤ 60 m apart / frontage ≤ 60 m) | MR 55 ข้อ 45, 46 | H |
| Window or balcony wall to boundary | ≥ 2 m if building ≤ 9 m; ≥ 3 m if 9–23 m | MR 55 ข้อ 50 | H |
| Spacing between buildings on one plot | ≤ 9 m: 4 m; 9–23 m: 6 m (amended by MR 61) | MR 55 ข้อ 48 | M |
| High-rise | height ≥ 23 m (ground to roof deck) | MR 33 ข้อ 1 | H |
| Extra-large building | ≥ 10,000 m² total floor area | MR 33 ข้อ 1 | H |
| Road and frontage for high-rise / extra-large | plot side ≥ 12 m long on a public road ≥ 10 m wide (≥ 18 m road if > 30,000 m²) | MR 33 ข้อ 2 (amended by MR 50) | H |
| Fire access | ≥ 6 m wide uncovered fire-truck road all round the building; may lie in the road setback | MR 33 ข้อ 3 | H |
| FAR ceiling, high-rise | ≤ 10 : 1 | MR 33 ข้อ 5 | H |
| Clear space all round, building > 15 m | ≥ 2 m | Bangkok Building Control Ordinance 2544 ข้อ 55 | H (secondary text) |
| Large building | > 2,000 m², or ≥ 15 m high and > 1,000 m² | Ordinance 2544 ข้อ 5(101) | H |
| Road width | full right-of-way width (ข้อ 5(4)); must hold along its whole length to a qualifying road (Supreme Admin. Court อ.588/2557) | — | H |
| Parking, condo in Bangkok | the larger of 1 space per unit ≥ 60 m² and 1 space per 120 m² of floor area | MR 7 + Ordinance 2544 | M |
| Parking space size | 2.40 × 5.00 m | MR 41 | M |
| EIA | condo ≥ 80 units or ≥ 4,000 m² | MNRE notification | M |

Gaps (U): consolidated MR 55 after MR 61 and MR 68; any Bangkok-only setbacks in Ordinance 2544; which areas are exempt from FAR (parking?); a window-wall setback for buildings ≥ 23 m.

## Primary sources
- MR 55 full text: https://data.yotathai.org/d/zx9hfz.pdf (Royal Gazette vol. 117, part 75 ก, p. 16)
- MR 33 / MR 50 and Ordinance 2544, as quoted in the Bangkok Council report: https://bmc.go.th/wp-content/uploads/2020/06/48_2562.pdf
- Ordinance 2544 ข้อ 55: https://so05.tci-thaijo.org/index.php/sarasatr/article/download/272771/183891/1143741
- Parking: https://so05.tci-thaijo.org/index.php/sarasatr/article/download/242164/168262/861885
- EIA: https://cuir.car.chula.ac.th/dspace/bitstream/123456789/82774/1/6470045425.pdf
- FAR cross-check: https://so09.tci-thaijo.org/index.php/PMR/article/view/7652
