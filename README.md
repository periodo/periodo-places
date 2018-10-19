## PeriodO placename gazetteers

This repository contains custom placename gazetteers used for
indicating the spatial coverage of PeriodO periods.

### Present-day countries gazetteer

This gazetteer was created by:

1. merging the [Natural Earth 1:110m cultural vectors](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/) for [countries](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/) and [map units](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-details/), such that if there is a country and a map unit with the same (long) name, the map unit is preferred,
2. using the ISO 3166-1 alpha-2 codes from the Natural Earth data to query Wikidata for the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).

The reason for merging the two sets is that in some cases (e.g. France) we want to separate the contiguous primary country geometry from the geometries of former colonial or territorial holdings around the world, and the procedure above achieves this. As a result the list also includes countries like Scotland and Wales, even though these are technically parts of the sovereign country of the United Kingdom.

Note also that:

* Natural Earth is missing ISO 3166-1 alpha-2 codes for Norway, Papua New Guinea, and Serbia, so these have been added.
* Bougainville, Northern Cyprus, Somaliland, and the West Bank are not included, as these do not have ISO country or country subdivision codes in Wikidata.

### U.S. states gazetteer

