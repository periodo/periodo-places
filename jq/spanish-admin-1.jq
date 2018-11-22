.features
| map(select(.properties.sov_a3 == "ESP"))
| map({(.properties.name): {geometry}})
| add
