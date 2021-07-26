.features
| map(select(.properties.gu_a3 == "THA"))
| map({(.properties.name): {geometry}})
| add
