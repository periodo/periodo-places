.features
| map(select(.properties.scalerank == 0))
| map({(.properties.name_en): {geometry}})
| add
