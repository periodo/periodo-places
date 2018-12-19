# select features in sovereign Russia with scalerank 0
[
 .features[]
 | select(.properties.sr_sov_a3 == "RUS" and .properties.scalerank == 0)
]
# take the 2nd and 3rd and 6th (Western Russia and Kaliningrad and Crimea)
| .[1,2,5]
| .geometry
