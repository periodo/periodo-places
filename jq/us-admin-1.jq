# get list of features
.features
# select ones in the US
| map(select(.properties.iso_a2 == "US"))
# extract object with ISO 3166-2 code and geometry, keyed by name
| map({(.properties.name): {code: .properties.iso_3166_2,
                            type: "Feature",
                            geometry}})
# merge objects
| add
