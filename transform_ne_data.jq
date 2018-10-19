# create 2-item list of feature arrays: [countries, map_units]
[.[].features]
# concatenate them
| add
# extract object with ISO 3166-1 alpha-2 code and geometry, keyed by long name
| map({(.properties.NAME_LONG): {ccode: .properties.ISO_A2, geometry}})
# merge objects (map units replacing countries where name is same)
| add
# delete unrecognized countries
| del(
  ."Bougainville",
  ."Northern Cyprus",
  ."Somaliland",
  ."West Bank"
)
# supply missing ISO 3166-1 alpha-2 codes
| ."Norway".ccode = "NO"
| ."Papua New Guinea".ccode = "PG"
| ."Serbia".ccode = "RS"
# use ISO 3166-2 code for UK countries
| ."England".ccode = "GB-ENG"
| ."Northern Ireland".ccode = "GB-NIR"
| ."Scotland".ccode = "GB-SCT"
| ."Wales".ccode = "GB-WLS"
