#! /bin/bash
# shellcheck disable=SC2039

NM=./node_modules/.bin/
IDS=geometries/english-counties-ids.json
GEOMETRIES=geometries/english-admin-1.json
COUNTY=${1//_/ }
COUNTY_ID=$(jq -r '."'"$COUNTY"'".id' $IDS)
PARTS=$(jq -r '[."'"$COUNTY"'".covers[] | ".\"\(.)\""] | join(",")' $IDS)

jq "$PARTS | .geometry" $GEOMETRIES \
    | "$NM"geojson-clipping union \
    | jq '{"'"$COUNTY"'":{id:"'"$COUNTY_ID"'", geometry}}'
