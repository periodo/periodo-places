.features
| map(select(.properties.gu_a3 == "PHL"))
# .properties.name is not unique, but .properties.gns_name has missing values
| map({(.properties.gns_name // .properties.name): {geometry}})
| add
