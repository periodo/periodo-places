.features
| map(select(.properties.gu_a3 == "AFG"))
| map({(.properties.gn_name): {geometry}})
| add
