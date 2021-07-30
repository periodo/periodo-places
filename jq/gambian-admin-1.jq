.features
| map(select(.properties.adm0_a3 == "GMB"))
| map({(.properties.name): {geometry}})
| add
