.features
| map(select(.properties.gu_a3 == "BFA"))
| map({(.properties.name): {geometry}})
| add
