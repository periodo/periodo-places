.features
| map(select(.properties.gu_a3 == "YEM"))
| map({(.properties.name): {geometry}})
| add
