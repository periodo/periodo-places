.features
| map(select(.properties.gu_a3 == "UKR"))
| map({(.properties.name): {geometry}})
| add
