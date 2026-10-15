# Bougainville has gu_a3 PNB, the other provinces PNX
.features
| map(select(.properties.adm0_a3 == "PNG"))
| map({(.properties.name): {geometry}})
| add
