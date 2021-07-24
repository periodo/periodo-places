.features
| map(select(.properties.gu_a3 == "DZA"))
| map({(.properties.name): {geometry}})
| add
