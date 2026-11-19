# Indian Building Regulations: Reference Numbers

Values are copied from the official PDFs listed in `SOURCES.md`. Page citations use both:
- **PDF p.N**: 1-based page index in the downloaded file (what a PDF viewer shows).
- **printed p.N**: page number printed in the footer of the document.

For MBBL 2016, **PDF page = printed page + 18** throughout the body of the document.

| Key | Source | File |
|---|---|---|
| MBBL | Model Building Bye-Laws 2016, TCPO / Ministry of Urban Development (hosted on mohua.gov.in) | `src/mbbl_2016_mohua.pdf` |
| RERA | Real Estate (Regulation and Development) Act, 2016 (India Code, text "as on 15th May, 2026") | `src/rera_act_2016.pdf` |

**Not covered.** UDCPR Maharashtra 2020 and Bengaluru (BBMP Bye-laws 2003 / RMP 2015 zoning) are missing because no official copy could be downloaded. See `SOURCES.md`.

**Unit convention trap in MBBL.** Table 3.3 and Section 3.4.4 (Group Housing) give FAR as a percentage-style number, for example `150` meaning FAR 1.50. Table 3.4 and Sections 3.5 to 3.10 give it as a ratio, for example `1.20`. Normalise before use.

---

## 1. Definitions

| Term | Definition (verbatim or near-verbatim) | Citation |
|---|---|---|
| Floor Area Ratio (FAR) | "The quotient obtained by dividing the combined covered area (plinth area) of all floors, excepting areas specifically exempted under these regulations, by the total area of the plot", i.e. `FAR = Total Covered Area on All Floors / Plot Area` | MBBL §1.1(45), PDF p.24–25 (printed p.6–7) |
| FSI | Not used in MBBL. FSI is the Maharashtra term for the same ratio, but UDCPR was not available to confirm its definition there. | — |
| Ground coverage | **No standalone definition in MBBL.** It is used throughout Ch.3 as "Maximum Ground Coverage %". Treat it as covered area (below) / plot area × 100. | MBBL Ch.3, e.g. Table 3.3, PDF p.53 |
| Covered Area | "The Ground area covered immediately above the plinth level covered by the building but does not include the space covered by: (a) Garden, rockery, well and well structures, plant nursery, water pool, swimming pool (if uncovered), platform round a tree, tank, fountain, bench, chabutra with open top and unenclosed on sides by walls and the like; (b) Drainage culvert, conduit, catch-pit, gully-pit, chamber, gutter and the like; (c) Compound wall, gate, slide/ swing door, canopy, and areas covered by chajja or similar projections and staircases which are uncovered and open at least on three sides and also open to sky." | MBBL §1.1(29), PDF p.23 (printed p.5) |
| Plinth Area | "The built up covered area measured at the floor level of the basement or of any storey." | MBBL §1.1(95), PDF p.28 (printed p.10) |
| Built-up area | **No standalone definition in MBBL.** The term appears only inside "Plinth Area" and in the parking norms ("ECS/100 sqm built up area"). | MBBL §1.1(95); Table 3.1 |
| Area (of a building) | "the superficies of a horizontal section thereof made at the plinth level inclusive of the external walls and of such portions of the party walls as belong to the building" | MBBL §1.1(11), PDF p.20 (printed p.2) |
| Carpet Area (MBBL) | "The covered area of the usable rooms of a dwelling unit / at any floor (excluding the area of the walls)." | MBBL §1.1(22), PDF p.23 (printed p.5) |
| **Carpet Area (RERA)** | "the net usable floor area of an apartment, excluding the area covered by the external walls, areas under services shafts, exclusive balcony or verandah area and exclusive open terrace area, but includes the area covered by the internal partition walls of the apartment." Explanation: "exclusive balcony or verandah area" means the area of the balcony or verandah appurtenant to the net usable floor area of an apartment, meant for the exclusive use of the allottee. "Exclusive open terrace area" means the area of open terrace appurtenant to the net usable floor area of an apartment, meant for the exclusive use of the allottee. | RERA s.2(k), PDF p.7 (printed p.7) |
| Set-back Line | "A line usually parallel to the plot boundaries or center line of a road and laid down in each case by the Authority or as per recommendations of Master/Zonal Plan, beyond which nothing can be constructed towards the plot boundaries excepting with the permission of the Authority." | MBBL §1.1(111), PDF p.29 (printed p.11) |
| Building Height | "The vertical distance measured (i) In the case of flat roofs from the average level of the front road and continuance to the highest point of the building. (ii) In case of pitched roofs upto the point where the external surface of the outer wall intersects the finished surface of the sloping roof and (iii) In the case of gables facing the road midpoint between the eaves level and the ridge." Decorative features are excluded. "The height of the building shall be taken upto the terrace level for the purpose of fire safety requirement." | MBBL §1.1(17), PDF p.22 (printed p.4) |
| Multi-Storeyed / High Rise Building | "A building above 4 stories, and/or a building exceeding 15 meters or more in height (without stilt) and 17.5M (including stilt)." | MBBL §1.1(16)(b), PDF p.21 (printed p.3) |
| High Rise (Ch.5) | "Buildings higher than 15m of height without stilts and above 17.5 m of height with stilts shall be considered as high rise building." | MBBL §5.1, PDF p.99 (printed p.81) |
| Habitable Room | A room for "study, living, sleeping, eating, kitchen if it is used as a living room", excluding bathrooms, WCs, laundries, serving and store pantries, corridors, cellars, attics, and spaces "not used frequently or during extended periods". | MBBL §1.1(65), PDF p.26 (printed p.8) |
| Room Height | From finished floor to finished ceiling. Where there is no finished ceiling, measure to the underside of joists, beams or tie beams. | MBBL §1.1(109), PDF p.29 (printed p.11) |
| Loft | Intermediate floor or residual space for storage "with maximum clear height of 1.5 meters". | MBBL §1.1(75), PDF p.27 (printed p.9) |
| Special Building | Includes assembly, industrial, wholesale, hotels, hostels, hazardous, and "centrally air conditioned buildings having total built up area exceeding 500 sq m". | MBBL §1.1(16), PDF p.22 (printed p.4) |

---

## 2. Areas exempt from FAR / covered area (MBBL)

| Item | Condition | Citation |
|---|---|---|
| Lift machine room on top floor | As required for lift installation. "The shaft provided for lift shall be taken for covered area calculations only on one floor." | §4.29.1.1(a), PDF p.83 (printed p.65) |
| Rockery, well, nursery, uncovered pool, tree platform, tank, fountain, bench, open chabutara, open ramps, compound wall, gate, slide/swing door | — | §4.29.1.1(b), PDF p.83 |
| Uncovered staircase | "uncovered and unclosed on three sides except for a 0.90 m. high railing/wall" | §4.29.1.1(b), PDF p.83 |
| Overhead water tank on top of building / open shafts | — | §4.29.1.1(b), PDF p.83 |
| Mumty over staircase on top floor | Height exemption only up to 3.00 m (§4.29.3(c)) | §4.29.1.1(c), PDF p.83 |
| Culvert on municipal drains | — | §4.29.1.1(d), PDF p.83 |
| Cupboard / shelf projections (residential only) | Up to 0.75 m deep. No cupboard in the side setback on the ground floor. Overhang into setbacks ≤ 2.0 m length per habitable room. Exempt from covered area. | §4.29.1(d), PDF p.83 |
| Chajja / cornice / weather shade | Not more than 0.75 m wide. Not below 2.20 m above floor. | §4.29.1(a), PDF p.82 |
| Canopy over entrance | Each ≤ 4.50 m long × 2.40 m wide, clear height ≥ 2.2 m. Single-storey residential: 1 per detached block. Multi-storey residential: 2. | §4.29.1(b), PDF p.82 |
| Balcony at roof level (residential only) | Width 1.20 m, overhanging setbacks/courtyards. The minimum open space may not be reduced by more than 30%. | §4.29.1(c), PDF p.83 |
| Pergola (residential) | One per floor, ≤ 3.50 m², 40% void, clear height 2.20 m | §4.29.1(d)(iii), PDF p.83 |
| Group housing projections "without counting towards FAR" | Chajja ≤ 0.75 m. One canopy per block ≤ 4.5 m × 2.4 m. "Balcony at roof slab level of 1.2 m. width and area not exceeding 3.5 sq m. per bedroom but not exceeding 3 in number per flat." Balcony off toilet/bath, 1.2 m wide, for drying clothes. | §4.21(c), PDF p.76 (printed p.58) |
| Basement (residential plotted) | Use limited to parking, servicing, household storage. "The area of the basement should not be more than the ground coverage." (FAR treatment not stated for plotted housing.) | Table 3.3 notes 2–3, PDF p.53 |
| Basement (group housing) | "to be used for parking, services and for essential household storage and for providing facilities without counting in FAR". Quantum 33% to 50% of plot area. | §3.4.4 notes, PDF p.54 (printed p.36) |
| Basement (most non-residential: guest house, wholesale, flatted industry, govt office, etc.) | Up to building envelope, max 50% of plot area (hotels and govt offices: up to max extent of plot area), "if used for parking and services should not be counted in FAR" | §3.5.2, §3.6.8, §3.6.11, §3.7.1, §3.10.2, PDF p.55–60 |
| Basement (light/extensive industry) | **Counted in FAR** | Table 3.5/3.6 "Other Controls", PDF p.58–59 |
| Studio apartment basement | Parking/utilities/services only: not counted towards FAR | §3.4.7(iii), PDF p.55 |
| High-rise general | Louvers, pergolas, sunshine elements free of FAR. Non-habitable architectural rooftop structures out of FAR. Community sky bridges/landscape terraces free of FAR. "Service floors shall not be counted in FAR. Service area on habitable floors may be considered free from FAR." Atrium counted only once. Stilts in high-rise not restricted to 2.4 m height if used for parking. | §5.5.11(a)–(h), PDF p.108 (printed p.90) |
| Bus queue shelters | Not in coverage or FAR | §3.8, Table 3.7, PDF p.59 |
| Petrol pump | Ground coverage excludes canopy. Mezzanine counted in FAR. | §3.6.10(c), PDF p.57 |

**Not found in MBBL.** There is no general rule exempting **stair/lift lobbies on every floor**, **stilt parking in low-rise**, or **balconies in plotted housing** from FAR. Only the items above are listed. Local DCRs (e.g. UDCPR) usually differ here.

---

## 3. FAR and ground coverage tables (MBBL)

### 3.1 Residential plotted (Table 3.3, PDF p.53, printed p.35)

FAR is printed as a percentage-style number. The `FAR (ratio)` column shows the same value divided by 100.

| Plot area (m²) | Max ground coverage % | FAR (as printed) | FAR (ratio) | Max DUs | Max height (m) |
|---|---|---|---|---|---|
| 30 | 75 | 150 | 1.50 | 1 | 8 |
| >30 to 50 | 75 | 150 | 1.50 | 2 | 8 |
| >50 to 100 | 65 | 180 | 1.80 | 3 | 12 |
| >100 to 250 | 65 | 180 | 1.80 | 3 | 12 |
| >250 to 500 | 55 | 165 | 1.65 | 6 | 15 |
| >500 to 1000 | 45 | 120 | 1.20 | 8 | 15 |
| >1000 to 1500 | 40 | 100 | 1.00 | 8 | 15 |
| >1500 to 3000 | 33.3 | 100 | 1.00 | 12 | 15 |

Notes (same page): the basement may not be a dwelling unit, and its area may not exceed the ground coverage. "50% of the open area of the plot should be used for proper landscaping and for plantation." Minimum LIG plot 30 m² (§3.4.3, PDF p.53).

### 3.2 Group housing (§3.4.4, PDF p.53–54, printed p.35–36)

| Control | Value |
|---|---|
| Persons per DU (density basis) | 4.5 |
| Min plot | 3000 m² (hill towns 5000 m²) |
| Max ground coverage | 25% to 35% |
| Max FAR (printed) | "50 to 175 (higher FAR may be given depending on the pattern of development)" → 0.50–1.75 |
| Max FAR, hill areas (printed) | "50 (higher FAR may be given depending on the pattern of development and should not exceed 150)" |
| Max height | 15 m (plots up to 4000 m²); 26 m (plots above 4000 m²); hill areas 15 m for all plots |
| DU density | 25 to 175 DU/ha (net plot area) |
| Basement | 33% to 50% of plot area, not counted in FAR |

**Table 3.4 Net residential density of group housing, controls** (PDF p.54, printed p.36)

| Net density (DU/ha) | Max ground coverage % | FAR |
|---|---|---|
| 25 | 25 | 0.50 |
| 50 | 30 | 0.75 |
| 75 | 33 | 0.90 |
| 100 | 35 | 1.00 |
| 125 | 35 | 1.25 |
| 150 | 35 | 1.50 |
| 175 | 35 | 1.75 |

Note: the layout extraction prints the §3.4.4 FAR and "In hill areas" lines interleaved across the page break. The reading above comes from the layout-mode extraction. Check it against the PDF visually if it is critical.

### 3.3 Other residential-type premises

| Premises | Min plot | Max GC | Max FAR | Max height | Other | Citation |
|---|---|---|---|---|---|---|
| Resettlement / slum in-situ | min 25 m² (18 m² with 100% coverage if 7 m²/tenement pooled to cluster open space) | — | — | — | Max net density 250 tenements/ha. Pathways 2 m up to 30 m long, 3 m up to 50 m long. | §3.4.5, PDF p.54 |
| Low income housing | 30 m² (40 m² small/medium towns, 30 m² metros at GC ≤ 75%) | 100 (cluster, plots 15–30 m²) | 200 (cluster, plots 15–30 m²) | — | as printed: "ground coverage and FAR can be 100 and 200 respectively" | §3.4.6, PDF p.54 |
| Studio apartments | 2000 m² | 33.3% | 2.00 | NR (subject to AAI/Fire) | Max unit 60 m² built-up. Road ≥ 12 m. Parking 2.0 ECS/100 m² built-up. | §3.4.7, PDF p.55 |
| Foreign mission | — | 25% | 0.75 | 15 m | — | §3.5.1, PDF p.55 |
| Guest house / boarding / lodging / hostel | 500 m² | 30% | 1.20 | 15 m | Min R/W in front 20 m | §3.5.2, PDF p.55 |
| Dharmshala / baratghar / night shelter | 1000 m² | 30% | 1.20 | 26 m | Min R/W 16 m | §3.5.3, PDF p.55 |

### 3.4 Commercial (§3.6, PDF p.55–58, printed p.37–40)

| Premises | Max GC | Max FAR | Max height | Citation |
|---|---|---|---|---|
| Convenience shopping | 40% | 0.60 | 15 m (hills 6 m) | §3.6.1, PDF p.55 |
| Local / neighbourhood shopping centre | 30% (hills 35%) | 1.00 | 15 m (hills 9 m) | §3.6.2, PDF p.56 |
| Community centre | 25% (hills 30%) | 1.00 | 26 m (hills 15 m) | §3.6.3, PDF p.56 |
| District centre | 25% | 1.25 (hills 1.25) | 37 m ("upto 50 as per requirement"); hills 15 m | §3.6.4, PDF p.56 |
| CBD / city centre | 25% | 3.00 | As per requirement | §3.6.5, PDF p.56 |
| Sub-CBD | Same as district centre | | | §3.6.6, PDF p.56 |
| Other commercial centre | 25% | 1.00 | As per requirement | §3.6.7, PDF p.56 |
| Wholesale / warehousing / IFC | 30% | 0.80 | As per requirement | §3.6.8, PDF p.56 |
| Informal bazaar | 40% | 0.40 | 8 m | §3.6.9, PDF p.56 |
| Petrol filling-cum-service (36×30 to 45×33 m) | 20% | 0.20 | 6 m | front setback min 6 m; §3.6.10, PDF p.57 |
| Petrol filling station (30×17, 18×15 m) | 10% | 0.10 | 6 m | front setback min 3 m; §3.6.10, PDF p.57 |
| CNG mother station (max 36×30 m) | 20% | — | 4.5 m (single storey) | §3.6.10(d), PDF p.57 |
| Hotels | 40% | 3.00 (hills 1.75) | As per requirement | 5% of FAR for hotel-related commercial; §3.6.11, PDF p.57 |
| Motels (min plot 1.0 ha) | 15% | 0.15 | 9 m | setbacks front 15 m, rear and sides 9 m; parking 1.67 ECS/100 m²; §3.6.12, PDF p.58 |
| Service apartments | 30% | 1.50 (hills 1.50) | As per requirement | parking 2 ECS/100 m²; §3.6.13, PDF p.58 |

### 3.5 Industrial / public (selected)

| Premises | Plot | Max GC | Max FAR (plains / hills) | Max height (plains / hills) | Citation |
|---|---|---|---|---|---|
| Flatted group industry | min 2000 m² | 30% | 1.20 / 1.00 | 15 m / 15 m | §3.7.1, PDF p.58 |
| Light & service industry | < 400 m² | 60% | 1.25 / 1.00 | 12 / 9 | Table 3.5, PDF p.58 |
| | >400 to 4000 | 50% | 1.25 / 1.00 | 12 / 12 | |
| | >4000 to 12000 | 45% | 1.25 / 1.00 | 12 / 12 | |
| | >12000 | 40% | 1.00 / 0.75 | 12 / 9 | |
| Extensive industry | 400 to 4000 | 50% | 1.00 / 0.75 | 9 | Table 3.6, PDF p.59 |
| | >4000 to 12000 | 45% | 0.90 / 0.60 | 9 | |
| | >12000 to 28000 | 40% | 0.80 / 0.50 | 9 | |
| | >28000 | 30% | 0.60 / 0.45 | 9 | |
| Public–semi-public general | — | 30% (hills 25%) | 2.00 / 1.00 | 26 m / 15 m | §3.10.1, PDF p.60 |
| Govt integrated office complex | — | 30% | 2.00 / 1.00 | 37 m / 15 m | §3.10.2, PDF p.60 |

### 3.6 FAR increments (MBBL §3.1, PDF p.47–49)

- **Purchasable FAR**: for plots on roads "24mtrs. and above". For institutional and industrial use, "minimum 18.0mtrs. road width". It is "allowed up to the maximum limit of the applicable FAR" and is never a matter of right. No construction may go beyond the maximum ground coverage. (§3.1.2, PDF p.48)
- **Additional / flexible FAR**: formula `(a+b+c+d+e)·m·n·o·p / (x+y)`. Values are in URDPFI 2014 and are not reproduced in MBBL. (§3.1.1, PDF p.47–48)
- **Floating FAR**: road V/C optimum 0.8, relaxable to 0.9. Water 135 LPCD minimum. (§3.1.3, PDF p.49)

---

## 4. Setbacks / open spaces

**Important.** MBBL does **not** give a setback table by plot size for ordinary plots. It defers: "The provision of minimum setbacks for different sizes of plots for all categories of the plots shall be as per the Master Plan/Development Plan or as per simplified Development Promotion Regulations of the Urban and Regional Development Plans Formulation and Implementation (URDPFI) Guidelines." (Ch.3 note (ii), PDF p.47, printed p.29). See also §4.25.1, PDF p.81: setbacks, covered area and FAR "shall be as per Master Plan/Zonal Plan".

### 4.1 Table 4.4 Exterior open spaces around buildings by height (PDF p.82, printed p.64)

"Exterior open spaces to be left on all sides in m. (front rear and sides in each plot)"

| Building height (m) | Open space on all sides (m) |
|---|---|
| 10 | 3 |
| 15 | 5 |
| 18 | 6 |
| 21 | 7 |
| 24 | 8 |
| 27 | 9 |
| 30 | 10 |
| 35 | 11 |
| 40 | 12 |
| 45 | 13 |
| 50 | 14 |
| 55 and above | 16 |

- Under the column header the PDF prints the phrase "As per prescribed set backs". From the extraction it is **unclear** whether this phrase is a merged cell for low heights or a sub-header. Verify it visually.
- Note: "On sides where no habitable rooms face, a minimum space of 9.0 m. shall be left for heights above 27.0 m."
- The table gives discrete heights only. It does not say whether to interpolate or use the next row up for intermediate heights. A conservative implementation uses the next higher row.

### 4.2 Other setback numbers

| Rule | Value | Citation |
|---|---|---|
| High-rise peripheral open space | "6 m all around the building and clear up to 40m height and beyond that a space of 9m all around" | §5.2, PDF p.99 (printed p.81) |
| Basement extent (high-rise) | No setbacks: leave 2 m. With setbacks: leave the required 6 m from the plot boundary (MPD reference) | §5.4.5(a), PDF p.102 |
| Podium | Leave min 3 m setback from the plot line | §4.28, PDF p.82 |
| Sunken setback | Up to 25% of total setback area may be sunk for light, ventilation or basement access, if fire tender movement is not hindered | §4.25.5, PDF p.81 |
| Interior open space (courtyard) | Min width 3.0 m in all directions for buildings ≤ 15 m / 17.5 m with stilts. Above that, mechanical ventilation is also mandatory. | §4.26.1, PDF p.81 |
| Courtyard for light (habitable rooms) | ≥ 3.0 m × 3.0 m for buildings up to 12.50 m. For higher buildings, NBC 2005 Part 3 §8.25 applies. | §4.30.1.1, PDF p.85 |
| Motels | Front 15 m, rear and sides 9 m | §3.6.12, PDF p.58 |
| Petrol pumps | Front min 6 m (filling-cum-service), 3 m (filling only) | §3.6.10, PDF p.57 |
| Farm buildings from R/W (Table 7.1) | NH (90 m) 60 m; Provincial Hwy (60 m) 37 m; Major urban road (30 m) 22 m; Village road (18 m) 13 m | §7.7.2, PDF p.121 (printed p.103) |

---

## 5. Height vs road width

| Rule | Value | Citation |
|---|---|---|
| General cap | "The maximum height of building shall not exceed 1.5 times the width of road abutting plus the front open spaces." → `H_max = 1.5 × (road_width + front_open_space)` | §4.29.2(a), PDF p.83 (printed p.65) |
| Corner / multi-road plots | Use the **wider** street, but "not exceed the maximum height as provided in the Master Plan" | §4.29.2(b), PDF p.83 |
| Aerodromes | AAI Colour-Coded Zoning Maps (CCZM) / NOCAS govern | §4.29.2(c), §3.9, PDF p.59–60, 83 |
| Height exemptions | Roof tanks + supports ≤ 1.0 m. Lift / AC / ventilation rooms. Stair mumty ≤ 3.00 m. Chimneys, parapets and architectural features ≤ 1.50 m (unless their aggregate area > 1/3 of roof area). | §4.29.3, PDF p.84 |
| Low-rise cap with stilt | "For low rise development, the maximum height permitted is 15mts. However where the stilt floor is to be constructed for parking the height may be increased to 17.5 mtr." | §4.28, PDF p.82 |
| Per-use caps | See the Ch.3 tables above (e.g. plotted residential 8/12/15 m by plot size) | Table 3.3, PDF p.53 |

Ambiguity: "1.5 times the width of road abutting plus the front open spaces" can be read as `1.5 × (W + F)` or `1.5 × W + F`. The text has no brackets. Choose one and flag it in the UI.

---

## 6. Parking

### 6.1 Table 3.1 Parking standards (PDF p.50–51, printed p.32–33)

| Use | Standard |
|---|---|
| Residential plotted | "2 Equivalent Car Space (ECS) in plots of size 250‐300 sqm and 1ECS for every 100 sqm. built up area, in plots exceeding 300 sqm." (No norm stated for plots < 250 m².) |
| Group housing | 2.0 ECS / 100 m² built-up area |
| Cluster court housing | 2.0 ECS / 100 m² built-up area |
| Guest house / lodging / dharamshala | 2 ECS / 100 m² built-up area |
| Convenience / local shopping | 2 ECS / 100 m² floor area |
| Service market | 2 ECS / 100 m² floor area |
| Community centre | 3 ECS / 100 m² floor area |
| District centre / sub-CBD | 3 ECS / 100 m² floor area |
| Metropolitan city centre retail | 3 ECS / 100 m² floor area |
| Hotel | 3 ECS / 100 m² floor area. Remark: population 2–10 lakh, 1 car space per 4 guest rooms; 10–50 lakh, 1 per 3; > 50 lakh, 1 per 2 (footnote: NBC 2005) |
| Service apartments | 3 ECS / 100 m² floor area |
| Wholesale / IFC | 3 ECS / 100 m² floor area (plots ≤ 300 m²: common parking) |
| Community hall | 3.0 ECS / 100 m² |
| Recreational club, socio-cultural, science centre, convention centre | 2 ECS / 100 m² |
| Old age home / hostels / night shelter etc. | 1.8 ECS / 100 m² |
| Integrated office complex, district court | 1.8 ECS / 100 m² |
| Head post office, veterinary | 1.33 ECS / 100 m² |
| Amusement park | 3 ECS / 100 m² |
| ISBT / Metro, hospitals, nursing institute | 2 ECS / 100 m² |
| Industrial (all plot sizes), flatted industry | 2 ECS / 100 m² floor area |
| Mixed land use | 2.0 ECS / 100 m² built-up area within premises |

### 6.2 Table 3.2 Permissible ECS per 100 m² floor area (PDF p.52, printed p.34)

| Residential | Commercial | Industrial | Public building | Semi-public | Mixed |
|---|---|---|---|---|---|
| 2.0 | 3.0 | 2.0 | 1.8 | 2.0 | 2.0 |

### 6.3 Other parking numbers

| Item | Value | Citation |
|---|---|---|
| ECS size (m²) | **Not defined in MBBL 2016.** The text only says "Public Garage - Based on the number of vehicles parked by ECU.(Appendix 'A-1')", and Appendix A-1 is an application form, not a size table. Do not invent a value. Take it from the local DCR. | §4.9.2, PDF p.72 |
| Private garage | min 3.0 m × 6.0 m, height ≥ 2.4 m | §4.9, PDF p.72 (printed p.54) |
| Multi-level parking building | Min plot 2000 m² (plains) / 1000 m² (hills); min 50 car spaces | §3.3.2, PDF p.52 |
| Ramps to basement/parking | ≥ 7.2 m wide two-way, 4 m one-way. Gradient 1:10 cars, 1:15 heavy vehicles. Curved ramps ≤ 1:12. | §4.24.7.1, PDF p.79; §5.4.7, PDF p.104 |
| Basement clear height | ≥ 2.4 m. Basement ceiling 0.9 m min to 1.2 m max above average ground. | §4.10.4, PDF p.72 |

---

## 7. Fire / high-rise requirements affecting massing

| Rule | Value | Citation |
|---|---|---|
| Fire chapter applicability | High-rise and buildings ≥ 15 m. Also Assembly, Institutional, Educational (> 2 storeys and built-up > 1000 m²), Business (plot > 500 m²), Mercantile (aggregate covered > 750 m²), Hotel, Hospital, etc. | §11.1, PDF p.139 (printed p.121) |
| Main street width for those buildings | "not be less than 12.0 m" | §4.24.3(a), PDF p.78 (printed p.60) |
| High-rise approach road | Hard surface, width "not less than 9 meters" | §5.1.2(a), PDF p.99 |
| Group housing approach road | 20.0 m (or as per Master Plan) with 6.0 m space around individual buildings (§4.24.3(e)). For multi-storey group housing in Ch.5, the approach road is "minimum 18 m". The two clauses conflict. | §4.24.3(e), PDF p.78; §5.1.2(e), PDF p.99 |
| Fire tender turning circle | ≥ 9.0 m radius | §4.24.3(b), PDF p.78; §5.1.2(b), PDF p.99 |
| Open space for fire tender | Up to 6.0 m width on all sides, hard surface. Load: 22 t low-rise, 45 t for ≥ 15 m. | §4.24.3(c), PDF p.78; §5.1.2(c), PDF p.99 |
| Entrance gate width | ≥ 5 m (§4.24.3(d)); ≥ 6 m for high-rise (§5.1.2(d)). Archway height ≥ 5 m. | PDF p.78, 99 |
| Peripheral open space (high-rise) | 6 m all round up to 40 m height; 9 m beyond | §5.2, PDF p.99 |
| Exterior open space by height | Table 4.4 (Section 4.1 above) | PDF p.82 |
| Refuge area | **No size or floor-interval norm in MBBL.** §8.10 only recommends a refuge "at the fire protected stair landing on each floor that can safely hold one or two wheelchairs". §5.4.9 requires glass-façade refuge areas to be fully openable. NBC 2016 Part 4 is the usual source, and it was not downloaded. | §8.10, PDF p.127–128; §5.4.9, PDF p.104–105 |
| Travel distance (Table 5.2, high-rise) | Residential, Educational, Institutional: 30.0 (Type 1 & 2) / 22.5 (Type 3 & 4). Assembly, Business, Mercantile: 30.0 / 30.0. Industrial 45.0. Storage 30.0. Hazardous 22.5. Fully sprinklered: +50%. | §5.4.5(d), PDF p.102 (printed p.84) |
| Travel distance (general) | 22.50 m residential/educational/institutional/hazardous; 30.0 m assembly/business/mercantile/industrial/storage | §4.24.5(a), PDF p.79 |
| Stair width (Table 5.1) | Residential dwellings 1.0 m; residential hotel 1.5 m; assembly 2.0 m; educational up to 30 m height 1.5 m; institutional/hospital 2.0 m; all other 1.5 m | PDF p.100 (printed p.82) |
| Stair tread / riser | Tread ≥ 0.25 m residential, 0.3 m others. Riser ≤ 0.19 m residential, 0.15 m others. "limited to 15 risers per flight" (§5.4.3(d)) **but** "limited to 12 per flight" in §4.17.4.1. The two clauses conflict. | PDF p.100; PDF p.75 |
| Corridor width (high-rise) | Residential: 1.0 m single-loaded, 1.8 m double-loaded. Others 1.5 m. | §5.4.8(b), PDF p.104 |
| Helipad | "Buildings above 200 m in height, helipad may be provided." | §5.5.8, PDF p.108 |

---

## 8. Minimum room sizes and heights (MBBL Ch.4)

| Space | Min area | Min width | Min height | Citation |
|---|---|---|---|---|
| Habitable room (only one room) | 9.5 m² | 2.4 m | 2.75 m floor to ceiling (bottom of slab). Clear under beam 2.4 m. AC rooms 2.4 m to duct / false ceiling. Pitched roof average 2.75 m. | §4.3.1–4.3.2, PDF p.69–70 (printed p.51–52) |
| Habitable rooms (two rooms) | 9.5 m² + 7.5 m² | 2.1 m | same | §4.3.2, PDF p.70 |
| LIG dwelling (two habitable rooms) | first 9 m² (width 2.5 m), other 6.5 m² (width 2.1 m), total ≥ 15.5 m² | — | — | §3.4.6(iv), PDF p.54 |
| Kitchen (separate dining provided) | 5.0 m² (4.5 m² if separate store) | 1.8 m | 2.75 m | §4.4, PDF p.70 |
| Kitchen used as dining | 7.5 m² | 2.1 m | 2.75 m | §4.4.2, PDF p.70 |
| Bathroom | 1.8 m² | 1.2 m | 2.1 m | §4.5, PDF p.70 |
| WC | 1.1 m² | 0.9 m | 2.1 m | §4.5.2, PDF p.70 |
| Combined bath + WC | 2.8 m² | 1.2 m | 2.1 m | §4.5.2, PDF p.70 |
| Bath/WC window | ≥ 0.3 m², side ≥ 0.3 m | | | §4.5.3(f), PDF p.71 |
| Loft / ledge | ≤ 25% of the room floor | | headroom below 2.2 m; loft max height 1.5 m | §4.6, PDF p.71 |
| Mezzanine | ≥ 9.5 m² if living room. Aggregate ≤ 1/3 plinth area. | | 2.2 m | §4.7, PDF p.71 |
| Store room (residential) | 3 m² | | 2.2 m | §4.8, PDF p.72 |
| Office room / shop / workspace | 6.0 m² | 2.1 m | | §4.22, PDF p.76 |
| Cabin | 3.0 m² | 1.0 m | | §4.13, PDF p.73 |
| Educational building ceiling (Table 4.2) | | | 3.6 m (cold regions 3 m) | PDF p.70 |
| Industrial building ceiling (Table 4.2) | | | 3.6 m (AC: 3 m) | PDF p.70 |
| Plinth | | | ≥ 450 mm above surrounding ground | §4.2.1, PDF p.69 |
| Parapet | | | 1.0 m to 1.2 m | §4.12, PDF p.73 |
| Boundary wall | | | 1.5 m above front street centre line (2.4 m if top 0.9 m open). Corner plot: 0.75 m for 10 m from intersection. | §4.14, PDF p.73 |
| Window area | ≥ 1/10 floor area (hot dry), 1/6 (wet hot), 1/8 (intermediate), 1/12 (cold). Kitchen +25%. Absolute minimum 1/10 of floor area for habitable rooms and kitchens. No point > 7.5 m from an opening. | §4.30.1.1–4.30.1.3, PDF p.84–85 |

---

## 9. How to use in code

**Inputs (user-entered or from site data).**
- Plot area (m²), plot frontage/depth (for envelope)
- Use / premises type (plotted residential, group housing, commercial sub-type, etc.)
- Abutting road width(s) (m); front open space (m)
- Proposed: number of floors, floor-to-floor height, footprint per floor, stilt yes/no, basement area and use
- Hill area yes/no; city population (hotel parking remark); proximity to airport (CCZM)
- Proposed per-floor areas split into counted / exempt items (Section 2)

**Lookups (from these tables, keyed by use and plot-size band).**
- Max ground coverage %, max FAR, max height, max DUs (Tables 3.3–3.6, §3.4–3.10)
- ECS rate (Table 3.1 / 3.2)
- Exterior open space by height (Table 4.4)

**Derived (compute, never store).**
- `max_footprint = plot_area × GC%`
- `max_total_floor_area = plot_area × FAR`. Normalise FAR first: values > 10 in Table 3.3 / §3.4.4 are ×100.
- `achieved_FAR = Σ(counted floor area) / plot_area`, after subtracting the Section 2 exemptions
- `H_max = min(use_table_height, 1.5 × (road_width + front_open_space), master_plan_cap, CCZM_cap)`. See the bracket ambiguity in Section 5.
- `is_high_rise = height > 15 (no stilt) or > 17.5 (with stilt)`; MBBL §1.1(16)(b) also counts "above 4 stories"
- `open_space_each_side = Table44(height)`; if high-rise, `max(that, 6 m if H ≤ 40 else 9 m)`
- `required_ECS = rate × built_up_or_floor_area / 100`. Residential plotted uses the 250–300 m² / > 300 m² rule.
- Fire-access checks: road ≥ 12 m (fire-chapter buildings), approach ≥ 9 m (high-rise), gate ≥ 5/6 m
- RERA carpet area = internal usable floor area including internal partitions, excluding external walls, shafts, exclusive balcony/verandah and exclusive open terrace

**Precedence (must be shown to the user).**
MBBL 2016 is a **model** for states and urban local bodies. It is not law in itself. Its own text says "All mandatory Master Plan/Zonal Plan regulations regarding use, land use, coverage, FAR, set-back, open space, height, number of stories, number of dwelling units, parking standards etc. ... shall be applicable mutatis mutandis" (§1.0, PDF p.19), and Ch.3 opens with "The provisions contained in Master Plan/Zonal Plan/Development Code ... shall apply" (PDF p.47). Therefore:
1. Local development authority DCR / Master Plan zoning (e.g. UDCPR, BBMP/BDA RMP zoning, DDA MPD) **overrides** MBBL.
2. MBBL is a fallback or default only. Label results "MBBL 2016 model values: verify with local authority".
3. NBC 2016 governs fire and life safety details (refuge areas etc.) that MBBL leaves to it.
4. RERA s.2(k) carpet area is a statutory definition for sale disclosure, independent of planning FAR.

**Known gaps and conflicts to encode as warnings.**
- No setback-by-plot-size table in MBBL (it defers to the Master Plan/URDPFI).
- No ECS dimension in MBBL.
- No refuge-area size in MBBL.
- Stair risers per flight: 12 (§4.17.4.1) vs 15 (§5.4.3(d)).
- Group housing approach road: 20 m (§4.24.3(e)) vs 18 m (§5.1.2(e)).
- Height formula bracket ambiguity (§4.29.2(a)).
- Table 4.4 "As per prescribed set backs" cell placement is unclear from extraction.
