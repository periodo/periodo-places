.features
| map(select(.properties.gu_a3 == "LAO"))
| map({(.properties.name): {geometry}})
| add
