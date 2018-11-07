# get list of features
.features
# extract object with ISO 3166-2 code and geometry, keyed by name
| map({(.properties.name): {code: .properties.iso_3166_2, geometry}})
# merge objects
| add
