# create list of feature arrays
[.[].features]
# concatenate them
| add
# extract object with ISO 3166-1 alpha-2 code and geometry, keyed by long name
| map({(.properties.NAME_LONG): {code: .properties.ISO_A2, geometry}})
# merge objects (keys replacing existing keys where name is same)
| add
