"""Snapshot OSM buildings, roads and rail stations around the demo area into starter/public/context.json.
Usage: python -I scripts/fetch_context.py S W N E out.json"""
import json, sys, urllib.parse, urllib.request

S, W, N, E = sys.argv[1:5]
Q = f"""[out:json][timeout:120];
(way["building"]({S},{W},{N},{E});
 way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|living_street)$"]({S},{W},{N},{E});
 node["railway"="station"]({S},{W},{N},{E}););
out tags geom;"""
for url in ("https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter",
            "https://maps.mail.ru/osm/tools/overpass/api/interpreter"):
    try:
        req = urllib.request.Request(url, data=urllib.parse.urlencode({"data": Q}).encode(),
                                     headers={"User-Agent": "plot-feasibility-tool/0.1"})
        d = json.load(urllib.request.urlopen(req, timeout=180))
        break
    except Exception as ex:
        print(url, ex, file=sys.stderr)
else:
    sys.exit("all Overpass endpoints failed")
r = lambda v: round(v, 6)
b, h, s = [], [], []
for e in d["elements"]:
    t = e.get("tags", {})
    if e["type"] == "node":
        s.append({"name": t.get("name:en") or t.get("name"), "c": [r(e["lon"]), r(e["lat"])]})
        continue
    g = [[r(p["lon"]), r(p["lat"])] for p in e["geometry"]]
    if "building" in t:
        if len(g) < 4 or g[0] != g[-1]:
            continue
        b.append({"id": e["id"], "g": g, "h": t.get("height"), "l": t.get("building:levels"), "t": t["building"], "n": t.get("name:en") or t.get("name")})
    else:
        h.append({"id": e["id"], "g": g, "k": t["highway"], "w": t.get("width"), "ln": t.get("lanes"), "n": t.get("name:en") or t.get("name")})
json.dump({"bbox": [float(W), float(S), float(E), float(N)], "source": "OpenStreetMap contributors via Overpass API (ODbL)",
           "fetched": d["osm3s"]["timestamp_osm_base"], "buildings": b, "roads": h, "stations": s},
          open(sys.argv[5], "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(len(b), "buildings", len(h), "roads", len(s), "stations")
