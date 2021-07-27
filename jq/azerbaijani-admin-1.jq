.features
| map(select(.properties.gu_a3 == "AZE"))
| map({(.properties.gn_name): {geometry}})
| add
