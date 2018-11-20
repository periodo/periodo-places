.features
| map(select(.properties.gu_a3 == "ENG"
         and (.properties.type == "Administrative County" or
              .properties.type == "City Corporation" or
              .properties.type == "Home Nation|Constituent Country" or
              .properties.type == "London Borough (city)" or
              .properties.type == "London Borough (royal)" or
              .properties.type == "London Borough" or
              .properties.type == "Metropolitan Borough" or
              .properties.type == "Unitary Authority" or
              .properties.type == "Unitary Single-Tier County"
              )))
 # fix naming issues in NE data
| map({(# St. Helens is misnamed as Merseyside
        if   (.properties.name == "Merseyside")
        then "St. Helens"

        # Wirral is misnamed as Halton
        elif (.properties.name    == "Halton" and
              .properties.name_en == null)
        then "Wirral"

        # prefer short name for Wigan
        elif (.properties.name == "Wigan")
        then "Wigan"

        # prefer short names for London Boroughs
        elif (.properties.type | startswith("London Borough"))
        then .properties.name

        else (.properties.name_en // .properties.name)
        end): {geometry}})
| add
