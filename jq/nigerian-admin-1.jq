.features
| map(select(.properties.gu_a3 == "NGA"))
| map({(.properties.name): {geometry}})
| add
