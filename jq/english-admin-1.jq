.features
| map(select(.properties.gu_a3 == "ENG"
         and (.properties.type == "Administrative County" or
              .properties.type == "City Corporation" or
              .properties.type == "Home Nation|Constituent Country" or
              .properties.type == "Metropolitan Borough" or
              .properties.type == "Unitary Authority" or
              .properties.type == "Unitary Single-Tier County"
              )))
 # fix naming issues in NE data
| map({(if   (.properties.name == "Merseyside") then "St. Helens"
        elif (.properties.name    == "Halton" and
              .properties.name_en == null)      then "Wirral"
        elif (.properties.name == "Wigan")      then "Wigan"
        else (.properties.name_en // .properties.name)
        end): {geometry}})
| add
