.features
| map(select(.properties.gu_a3 == "SYX"))
| map({(.properties.name): {geometry}})
| add
