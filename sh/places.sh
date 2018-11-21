#! /bin/bash
# shellcheck disable=SC2039

if [ "$#" -ne 2 ]; then
    echo "Usage: cat placenames | $0 ids.json geometries.json"
    exit 1
fi

IDS=$1
GEOMETRIES=$2

while read -r place; do
    ./sh/place.sh "$IDS" "$GEOMETRIES" "${place// /_}";
done
