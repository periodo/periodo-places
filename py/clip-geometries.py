import sys
import json
from shapely.geometry import shape
from shapely import to_geojson

# Remove the area of a Natural Earth admin-0 feature from the named
# places in a {name: {geometry}} object read from stdin.
#
# Usage: clip-geometries.py admin-0.json ADM0_A3 name [name ...]


def err(message):
    print(message, file=sys.stderr)


def main() -> int:
    if len(sys.argv) < 4:
        err(f"Usage: {sys.argv[0]} admin-0.json ADM0_A3 name [name ...]")
        return 1
    admin_0, adm0_a3, names = sys.argv[1], sys.argv[2], sys.argv[3:]

    with open(admin_0) as f:
        masks = [
            shape(feature["geometry"])
            for feature in json.load(f)["features"]
            if feature["properties"]["ADM0_A3"] == adm0_a3
        ]
    if len(masks) != 1:
        err(f"expected one {adm0_a3} feature in {admin_0}, found {len(masks)}")
        return 1
    mask = masks[0]

    places = json.load(sys.stdin)
    for name in names:
        if name not in places:
            err(f"no place named {name}")
            return 1
        clipped = shape(places[name]["geometry"]).difference(mask)
        if clipped.is_empty:
            err(f"clipping {name} by {adm0_a3} left nothing")
            return 1
        places[name]["geometry"] = json.loads(to_geojson(clipped))

    print(json.dumps(places))
    return 0


if __name__ == "__main__":
    sys.exit(main())
