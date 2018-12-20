#! /bin/bash
# shellcheck disable=SC2039

NM=./node_modules/.bin/

if [ "$#" -ne 3 ]; then
    echo "Usage: $0 ids.json geometries.json placename"
    exit 1
fi

IDS=$1
GEOMETRIES=$2
PLACE=${3//_/ }

PLACE_ID=$(jq -r '."'"$PLACE"'".id' "$IDS")
PARTS=$(jq -r '[."'"$PLACE"'".covers[] | ".\"\(.)\""] | join(",")' "$IDS")

if [ -z "$PARTS" ]; then
    echo '{"'"$PLACE"'":{"id":"'"$PLACE_ID"'"}}'
else
    jq "$PARTS | .geometry" "$GEOMETRIES" \
        | "$NM"geojson-clipping union \
        | jq '{"'"$PLACE"'":{id:"'"$PLACE_ID"'", geometry, type: "Feature"}}'
fi
