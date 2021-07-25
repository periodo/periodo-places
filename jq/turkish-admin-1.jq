.features
| map(select(.properties.gu_a3 == "TUR"))
| map({(.properties.name): {geometry}})
| add
