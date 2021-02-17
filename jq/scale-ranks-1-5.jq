.features
| map(select(.properties.scalerank > 0 and .properties.scalerank < 6))
| map(select((.properties.name_en != null) or (.properties.name != null)))
| map({(.properties.name_en // .properties.name): {geometry}})
| add
