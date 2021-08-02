.features
| map(select(.properties.gu_a3 == "KGZ"))
| map({(.properties.name): {geometry}})
| add
