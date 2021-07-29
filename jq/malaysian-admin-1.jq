.features
| map(select(.properties.gu_a3 == "MYS"))
| map({(.properties.name): {geometry}})
| add
