.features
| map(select(.properties.gu_a3 == "IRN"))
| map({(.properties.name): {geometry}})
| add
