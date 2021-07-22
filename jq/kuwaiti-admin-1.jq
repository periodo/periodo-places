.features
| map(select(.properties.gu_a3 == "KWT"))
| map({(.properties.name): {geometry}})
| add
