.features
| map(select(.properties.gu_a3 == "RUS"))
| map(select(.properties.name != null))
| map({(.properties.name): {geometry}})
| add
