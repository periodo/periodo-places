.features
| map(select(.properties.gu_a3 == "UZB"))
| map({(.properties.gns_name): {geometry}})
| add
