.features
| map(select(.properties.gu_a3 == "GRC"))
| map({(.properties.name): {geometry}})
| add
