#! /bin/bash

SERVER=https://data.perio.do

rm -f ~/.periodo-token

for gazetteer in gazetteers/*.json; do
    filename=${gazetteer#gazetteers/}
    if ! periodo -s $SERVER update-graph "$gazetteer" "places/${filename%.json}"
    then
        exit 1
    fi
done
