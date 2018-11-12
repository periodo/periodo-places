# values
.[]
# select main countries in Europe
| select(
  .code == "BE" or
  .code == "BY" or
  .code == "CH" or
  .code == "CZ" or
  .code == "DE" or
  .code == "DK" or
  .code == "EE" or
  .code == "ES" or
  .code == "FI" or
  .code == "FR" or
  .code == "GB" or
  .code == "IE" or
  .code == "IS" or
  .code == "IT" or
  .code == "LT" or
  .code == "LU" or
  .code == "LV" or
  .code == "NL" or
  .code == "NO" or
  .code == "PL" or
  .code == "PT" or
  .code == "SE" or
  .code == "UA"
)
| .geometry
