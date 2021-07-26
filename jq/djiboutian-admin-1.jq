.features
| map(select(.properties.gu_a3 == "DJI"))
| map({(.properties.name): {geometry}})
| add
