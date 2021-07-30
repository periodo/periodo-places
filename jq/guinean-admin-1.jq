.features
| map(select(.properties.gu_a3 == "GIN"))
| map({(.properties.name): {geometry}})
| add
