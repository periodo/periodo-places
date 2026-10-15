.features
# newer Natural Earth releases use uppercase property names
| map(.properties |= with_entries(.key |= ascii_downcase))
| map(select(.properties.scalerank == 0))
| map({(.properties.name_en): {geometry}})
| add
