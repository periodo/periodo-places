.features
| map(select(.properties.gu_a3 == "SAU"))
| map({(.properties.name): {geometry}})
| add
