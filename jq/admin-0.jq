# create list of feature arrays
[.[].features]
# keep only the 10m geometry (the first two inputs) for Tuvalu, which
# lower resolutions reduce to a single atoll
| to_entries
| map(.key as $i
      | .value
      | map(select($i < 2 or .properties.NAME_LONG != "Tuvalu")))
# concatenate them
| add
# extract object with ISO code, subregion and geometry, keyed by long name
| map({(.properties.NAME_LONG): {code: .properties.ISO_A2,
                                 subregion: .properties.SUBREGION,
                                 scalerank: .properties.scalerank,
                                 type: "Feature",
                                 geometry}})
# merge objects (keys replacing existing keys where name is same)
| add
