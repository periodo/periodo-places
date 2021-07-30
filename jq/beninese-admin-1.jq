.features
| map(select(.properties.gu_a3 == "BEN"))
| map({(.properties.name): {geometry}})
| add
