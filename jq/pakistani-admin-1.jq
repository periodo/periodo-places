.features
| map(select(.properties.gu_a3 == "PAK"))
| map({(.properties.name): {geometry}})
| add
