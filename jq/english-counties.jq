.features
| map(select(.properties.gu_a3 == "ENG"
         and (.properties.type == "Administrative County" or
              .properties.type == "Unitary Authority" or
              .properties.type == "Unitary Single-Tier County" or
              .properties.type == "Metropolitan Borough" or
              .properties.type == "City Corporation"
              )))
| map({(.properties.name_en // .properties.name): {geometry}})
| add
# admininstrative units that are parts of ceremonial counties
| del(."Barnsley")                     # part of South Yorkshire
| del(."Bath and North East Somerset") # part of Avon/Somerset
| del(."Bedford")                      # part of Bedfordshire
| del(."Birmingham")                   # part of West Midlands
| del(."Blackburn with Darwen")        # part of Lancashire
| del(."Blackpool")                    # part of Lancashire
| del(."Bolton")                       # part of Greater Manchester
| del(."Bournemouth")                  # part of Dorset
| del(."Bracknell Forest")             # part of Berkshire
| del(."Bradford")                     # part of West Yorkshire
| del(."Brighton and Hove")            # part of East Sussex
| del(."Buckinghamshire")              # part of Buckinghamshire
| del(."Bury")                         # part of Greater Manchester
| del(."Calderdale")                   # part of West Yorkshire
| del(."Central Bedfordshire")         # part of Bedfordshire
| del(."Cheshire East")                # part of Cheshire
| del(."Cheshire West and Chester")    # part of Cheshire
| del(."City of Sunderland")           # part of Tyne and Wear
| del(."Cornwall")                     # part of Cornwall
| del(."County Durham")                # part of County Durham
| del(."Coventry")                     # part of West Midlands
| del(."Darlington")                   # part of County Durham
| del(."Derby")                        # part of Derbyshire
| del(."Derbyshire")                   # part of Derbyshire
| del(."Doncaster")                    # part of South Yorkshire
| del(."Dorset")                       # part of Dorset
| del(."Dudley")                       # part of West Midlands
| del(."East Riding of Yorkshire")     # part of East Riding of Yorkshire
| del(."East Sussex")                  # part of East Sussex
| del(."Gateshead")                    # part of Tyne and Wear
| del(."Gloucestershire")              # part of Gloucestershire
| del(."Halton")                       # part of Cheshire
| del(."Hartlepool")                   # part of County Durham
| del(."Isles of Scilly")              # part of Cornwall
| del(."Kent")                         # part of Kent
| del(."Kingston upon Hull")           # part of East Riding of Yorkshire
| del(."Kirklees")                     # part of West Yorkshire
| del(."Knowsley")                     # part of Merseyside
| del(."Lancashire")                   # part of Lancashire
| del(."Leeds")                        # part of West Yorkshire
| del(."Leicester")                    # part of Leicestershire
| del(."Leicestershire")               # part of Leicestershire
| del(."Lincolnshire")                 # part of Lincolnshire
| del(."Liverpool")                    # part of Merseyside
| del(."Luton")                        # part of Bedfordshire
| del(."Manchester")                   # part of Greater Manchester
| del(."Medway")                       # part of Kent
| del(."Middlesbrough")                 # part of North Yorkshire
| del(."Milton Keynes")                # part of Buckinghamshire
| del(."Newcastle upon Tyne")          # part of Tyne and Wear
| del(."North East Lincolnshire")      # part of Lincolnshire
| del(."North Lincolnshire")           # part of Lincolnshire
| del(."North Somerset")               # part of Somerset
| del(."North Tyneside")               # part of Tyne and Wear
| del(."North Yorkshire")               # part of North Yorkshire
| del(."Oldham")                       # part of Greater Manchester
| del(."Poole")                        # part of Dorset
| del(."Reading")                      # part of Berkshire
| del(."Redcar and Cleveland")          # part of North Yorkshire
| del(."Rochdale")                     # part of Greater Manchester
| del(."Rotherham")                    # part of South Yorkshire
| del(."Salford")                      # part of Greater Manchester
| del(."Sandwell")                     # part of West Midlands
| del(."Sefton")                       # part of Merseyside
| del(."Sheffield")                    # part of South Yorkshire
| del(."Slough")                       # part of Berkshire
| del(."Solihull")                     # part of West Midlands
| del(."Somerset")                     # part of Somerset
| del(."South Gloucestershire")        # part of Gloucestershire
| del(."South Tyneside")               # part of Tyne and Wear
| del(."St. Helens")                   # part of Merseyside
| del(."Stockport")                    # part of Greater Manchester
| del(."Stockton-on-Tees")             # part of County Durham
| del(."Tameside")                     # part of Greater Manchester
| del(."Trafford")                     # part of Greater Manchester
| del(."Wakefield")                    # part of West Yorkshire
| del(."Walsall")                      # part of West Midlands
| del(."Warrington")                   # part of Cheshire
| del(."West Berkshire")               # part of Berkshire
| del(."Wigan")                        # part of Greater Manchester
| del(."Windsor and Maidenhead")       # part of Berkshire
| del(."Wirral")                       # part of Merseyside
| del(."Wokingham")                    # part of Berkshire
| del(."Wolverhampton")                # part of West Midlands
| del(."York")                         # part of North Yorkshire
| del(."Nottinghamshire")              # part of Nottinghamshire
| del(."Nottingham")                   # part of Nottinghamshire
| del(."Cambridgeshire")
| del(."Peterborough")
| del(."Devon")
| del(."Plymouth")
| del(."Torbay")
| del(."Hampshire")
| del(."Portsmouth")
| del(."Southampton")
| del(."Essex")
| del(."Southend-on-Sea")
| del(."Thurrock")
| del(."Staffordshire")
| del(."Stoke-on-Trent")
| del(."Wiltshire")
| del(."Swindon")
| del(."Shropshire")
| del(."Telford and Wrekin")
