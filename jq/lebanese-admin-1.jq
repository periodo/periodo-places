.features
| map(select(.properties.gu_a3 == "LBN"))
| map({(.properties.name): {geometry}})
| add
