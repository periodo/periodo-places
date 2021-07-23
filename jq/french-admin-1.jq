.features
| map(select(.properties.adm0_a3 == "FRA"))
| map({(.properties.name): {geometry}})
| add
