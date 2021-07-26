.features
| map(select(.properties.gu_a3 == "OMN"))
| map({(.properties.name): {geometry}})
| add
