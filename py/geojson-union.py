import sys
import json
from shapely.geometry import Polygon, MultiPolygon, shape
from shapely.ops import unary_union
from shapely.validation import explain_validity
from shapely import to_geojson, make_valid


def err(message):
    print(message, file=sys.stderr)

def load_geometries():
    geometries = []
    for line in sys.stdin:
        line = line.strip()
        if line:
            geometries.append(json.loads(line))
    return geometries

def handle_single_geometry(geometry):
    single_geometry = shape(geometry)
    if isinstance(single_geometry, MultiPolygon):
        return {"type": "Feature", "geometry": geometry, "properties": {}}
    elif isinstance(single_geometry, Polygon):
        multi_coords = [list(single_geometry.exterior.coords)] + [
            list(interior.coords) for interior in single_geometry.interiors
        ]
        return {
            "type": "Feature",
            "geometry": {"type": "MultiPolygon", "coordinates": [multi_coords]},
            "properties": {},
        }
    else:
        raise Exception("input geometry type is not a polygon or multi-polygon")

def handle_multiple_geometries(geometries):
    valid_geometries = []
    for geom in geometries:
        geometry = shape(geom)
        if not isinstance(geometry, (Polygon, MultiPolygon)):
            raise Exception(f"Invalid geometry type: {type(geometry).__name__}")
        valid_geometries.append(geometry)

    union_result = unary_union(valid_geometries)

    if not isinstance(union_result, MultiPolygon):
        raise Exception(f"Invalid geometry type: {type(union_result).__name__}")

    return {
        "type": "Feature",
        "geometry": json.loads(to_geojson(union_result)),
        "properties": {},
    }


def main() -> int:
    geometries = load_geometries()
    if len(geometries) == 0:
        err("no geometries supplied")
        return 1
    try:
        feature = handle_single_geometry(geometries[0]) if len(geometries) == 1 else handle_multiple_geometries(geometries)
        geometry = shape(feature["geometry"])
        reason = explain_validity(geometry)
        if not reason == "Valid Geometry":
            err(f"Feature {feature['id']} is invalid:\n{reason}\nFixing...")
            feature["geometry"] =  json.loads(to_geojson(make_valid(geometry)))
        print(json.dumps(feature))
        return 0
    except Exception as e:
        err(e)
        return 1

if __name__ == "__main__":
    sys.exit(main())
