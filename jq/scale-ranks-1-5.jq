.features
| map(select(.properties.scalerank > 0 and .properties.scalerank < 6))
| map(select(.properties.name_en != null))
| map({(.properties.name_en): {geometry}})
| add
