.features
| map(select(.properties.gu_a3 == "ITA"))
| map({(.properties.name): {geometry}})
| add
