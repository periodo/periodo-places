# create list of feature arrays
[.[].features]
# concatenate them
| add
# extract object with ISO code, subregion and geometry, keyed by long name
| map({(.properties.NAME_LONG): {code: .properties.ISO_A2,
                                 subregion: .properties.SUBREGION,
                                 scalerank: .properties.scalerank,
                                 geometry}})
# merge objects (keys replacing existing keys where name is same)
| add
