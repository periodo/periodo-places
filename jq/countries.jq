# delete non-countries (according to ISO/Wikidata)
del(
."Adjara",
."Akrotiri",
."American Samoa",
."Antarctica",
."Antigua",
."Ashmore and Cartier Islands",
."Azores",
."Baikonur Cosmodrome",
."Bajo Nuevo Bank (Petrel Islands)",
."Baker Island",
."Barbuda",
."Bougainville",
."Bouvet Island",
."Brcko District",
."Brussels",
."Caribbean Netherlands",
."Christmas Island",
."Clipperton Island",
."Cocos Islands",
."Coral Sea Islands",
."Cyprus U.N. Buffer Zone",
."Dhekelia",
."Federation of Bosnia and Herzegovina",
."Flemish Region",
."French Guiana",
."French Polynesia",
."French Southern and Antarctic Lands",
."Gaza",
."Guadeloupe",
."Guam",
."Heard I. and McDonald Islands",
."Hong Kong",
."Howland Island",
."Indian Ocean Territories",
."Iraqi Kurdistan",
."Jan Mayen Island",
."Jarvis Island",
."Johnston Atoll",
."Kingman Reef",
."Korean DMZ (north)",
."Korean DMZ (south)",
."Macao",
."Madeira",
."Martinique",
."Mayotte",
."Midway Islands",
."Navassa Island",
."New Caledonia",
."Norfolk Island",
."Northern Cyprus",
."Northern Mariana Islands",
."Palmyra Atoll",
."Paracel Islands",
."Puerto Rico",
."Puntland",
."Republic Srpska",
."Réunion",
."Saint Pierre and Miquelon",
."Saint-Barthélemy",
."Saint-Martin",
."Scarborough Reef",
."Serranilla Bank",
."Siachen Glacier",
."Somaliland",
."Spratly Islands",
."Svalbard Islands",
."Syrian Arab Republic", # duplicate of Syria due to inconsistent naming in NE
."Tokelau",
."UNDOF Zone",
."US Naval Base Guantanamo Bay",
."United States Minor Outlying Islands",
."United States Virgin Islands",
."Vojvodina",
."Wake Atoll",
."Wallis and Futuna Islands",
."Walloon Region",
."West Bank",
."Western Sahara",
."Zanzibar",
."Åland Islands"
)
# supply missing ISO 3166-1 alpha-2 codes
| ."France".code = "FR"
| ."Norway".code = "NO"
| ."Somalia".code = "SO"
| ."Georgia".code = "GE"
| ."Iraq".code = "IQ"
| ."Netherlands".code = "NL"
| ."Serbia".code = "RS"
| ."Portugal".code = "PT"
| ."Papua New Guinea".code = "PG"
# use ISO 3166-2 code for UK countries
| ."England".code = "GB-ENG"
| ."Northern Ireland".code = "GB-NIR"
| ."Scotland".code = "GB-SCT"
| ."Wales".code = "GB-WLS"
