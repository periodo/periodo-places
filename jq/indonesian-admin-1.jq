.features
| map(select(.properties.gu_a3 == "IDN"))
| map({(.properties.name): {geometry}})
| add
