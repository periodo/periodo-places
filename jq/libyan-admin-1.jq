.features
| map(select(.properties.gu_a3 == "LBY"))
| map({(.properties.name): {geometry}})
| add
