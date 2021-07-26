.features
| map(select(.properties.gu_a3 == "ETH"))
| map({(.properties.name): {geometry}})
| add
