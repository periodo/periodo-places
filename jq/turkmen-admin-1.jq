.features
| map(select(.properties.gu_a3 == "TKM"))
| map({(.properties.name): {geometry}})
| add
