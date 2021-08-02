.features
| map(select(.properties.gu_a3 == "JOR"))
| map({(.properties.name): {geometry}})
| add
