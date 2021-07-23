.features
| map(select(.properties.gu_a3 == "EGY"))
| map({(.properties.name): {geometry}})
| add
