.features
| map(select(.properties.gu_a3 == "NER"))
| map({(.properties.name): {geometry}})
| add
