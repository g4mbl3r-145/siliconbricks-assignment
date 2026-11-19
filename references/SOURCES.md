# Sources

Download date for all files: **2026-11-20**. Files are stored in `src/`.

| File | Document | Original URL | Size (bytes) | SHA-256 |
|---|---|---|---|---|
| `src/mbbl_2016_mohua.pdf` | Model Building Bye-Laws 2016, TCPO / Ministry of Urban Development (270 pages) | https://www.mohua.gov.in/static/uploads/2026/07/0e33558a9326c8a89f945cae00cc3647.pdf | 3126378 | `40dfd3fdb0f81be498aba34b7b1ec45eeb3a7a9edb358ae6c8bb242d416a3174` |
| `src/rera_act_2016.pdf` | Real Estate (Regulation and Development) Act, 2016, India Code text "as on 15th May, 2026" (41 pages) | https://www.indiacode.nic.in/indiacode/bitstream/123456789/2158/1/A201616.pdf | 461032 | `de667f409ba9a77e3361140a51523c3165d3b868b9881eeba397c2a9cbef45a9` |

## Attempted, not kept

| Target | URL tried | Result |
|---|---|---|
| UDCPR Maharashtra 2020 | https://maharashtra.gov.in/Upload/PDF/Maharashtra_Regional_Town_Planning_Act_UDCPR.pdf | Downloaded, but it is a 58-page, mostly Marathi scanned **amendment notification** (March 2024), not the consolidated UDCPR. Deleted. |
| UDCPR / MBBL (Maharashtra) | https://maharashtra.gov.in/Upload/PDF/byelaws.pdf | A 10-page Maharashtra UD notification dated 30 Sep 2024 incorporating the MoHUA **addendum** to MBBL 2016 into UDCPR. Not the MBBL itself. Deleted. |
| UDCPR consolidated | — | No official full-text PDF found on maharashtra.gov.in. Only third-party copies were found (udri.org, griha, IGBC, Scribd), and those were skipped as unofficial. |
| BBMP Building Bye-laws 2003 | https://site.bbmp.gov.in/PDF/Bangalore-Building-Byelaws-%202003.pdf (https and http) | Connection timeout. |
| BBMP (alt host) | https://bbmp.gov.in/ | TLS certificate expired. Not bypassed. |
| RMP 2015 zoning regulations | https://site.bbmp.gov.in/PDF/townplanning/Zoning_Regulations_RMP2015f%20(1).pdf | Connection timeout. |
| RMP 2015 zoning amendments (BDA) | https://bdabangalore.org/uploads/files/TPM_Documents/Amendments_to_Zoning_Regulation_All.pdf | Connection timeout. |

## Extraction

Text was extracted with `pypdf` (project venv), using `extract_text()` per page. For the Table 3.3 / §3.4.4 / Table 4.4 pages, `extraction_mode="layout"` was also used. Scripts were run from the session scratchpad with `python -I`. Page rendering (pdftoppm) was not available, so tables were not checked visually.
