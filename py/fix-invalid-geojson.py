import json
import sys
from shapely.geometry import shape
from shapely.validation import explain_validity
from shapely import make_valid


def err(message):
    print(message, file=sys.stderr)


def fix_invalid_geometries(path):
    try:
        with open(path, "r") as f:
            geojson_data = json.load(f)

        if "features" not in geojson_data:
            raise Exception("No features key in gazetteer")

        for feature in geojson_data["features"]:
            geometry = shape(feature["geometry"])
            reason = explain_validity(geometry)
            if not reason == "Valid Geometry":
                err(f"Feature {feature['id']} is invalid:\n{reason}\nFixing...")
                feature["geometry"] = make_valid(geometry).__geo_interface__

        return geojson_data

    except FileNotFoundError:
        err(f"File not found at {path}")
        return None
    except json.JSONDecodeError:
        err(f"Invalid JSON in file {path}")
        return None
    except Exception as e:
        err(e)
        return None


import json


def main(args) -> int:
    corrected_geojson = fix_invalid_geometries(args[0])
    if corrected_geojson is None:
        return 1
    with open(args[0], "w") as f:
        json.dump(corrected_geojson, f, indent=2)
    return 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(
            f"""Usage:
{sys.argv[0]} gazetteer.json"""
        )
        sys.exit(2)
    else:
        sys.exit(main(sys.argv[1:]))
