.features
| map(select(.properties.adm0_a3 == "GEO"))
| map({(.properties.name): {geometry}})
| add
