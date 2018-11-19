#! /bin/bash
# shellcheck disable=SC2039

while read -r county; do
    ./sh/english-county.sh "${county// /_}";
done
