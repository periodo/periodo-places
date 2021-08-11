.features
| map(select(.properties.gu_a3 == "SDN"))
| map({(.properties.name): {geometry}})
| add
