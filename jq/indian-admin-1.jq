.features
| map(select(.properties.gu_a3 == "IND"))
| map({(.properties.name): {geometry}})
| add
