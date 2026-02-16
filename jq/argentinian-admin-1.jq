.features
| map(select(.properties.gu_a3 == "ARG"))
| map({(.properties.name): {geometry}})
| add
