# get all periods
.authorities[].periods[]
# except those missing spatial coverage
| select(.spatialCoverage != null)
# get spatial coverage ids
| .spatialCoverage[].id
