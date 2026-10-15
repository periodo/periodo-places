.features
# newer Natural Earth releases use uppercase property names
| map(.properties |= with_entries(.key |= ascii_downcase))
| map(select(.properties.scalerank > 0 and .properties.scalerank < 6))
| map(select((.properties.name_en != null) or (.properties.name != null)))
| map({(.properties.name_en // .properties.name): {geometry}})
| add
