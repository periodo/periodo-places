.features
| map(select(.properties.gu_a3 == "VNM"))
| map({(.properties.name): {geometry}})
| add
