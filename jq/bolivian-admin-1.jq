.features
| map(select(.properties.gu_a3 == "BOL"))
| map({(.properties.name): {geometry}})
| add
