.features
| map(select(.properties.featurecla == "Continent"))
| map({(.properties.name_en): {geometry}})
| add
| del(."Australia") # will replace with Oceania
| del(."Asia") # will broaden geometry with Malay Archipelago
