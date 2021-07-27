.features
| map(select(.properties.gu_a3 == "ISR"))
| map({(.properties.name): {geometry}})
| add
