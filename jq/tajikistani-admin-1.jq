.features
| map(select(.properties.gu_a3 == "TJK"))
| map({(.properties.name): {geometry}})
| add
