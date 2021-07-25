.features
| map(select(.properties.gu_a3 == "IRR" or .properties.gu_a3 == "IRK"))
| map({(.properties.name): {geometry}})
| add
