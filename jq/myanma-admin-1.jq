.features
| map(select(.properties.gu_a3 == "MMR"))
| map({(.properties.name): {geometry}})
| add
