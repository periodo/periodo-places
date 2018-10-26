# create 2-item list of feature arrays: [countries, map_units]
.features
# extract object with ISO 3166-2 code and geometry, keyed by name
| map({(.properties.name): {code: .properties.iso_3166_2, geometry}})
# merge objects (map units replacing countries where name is same)
| add
