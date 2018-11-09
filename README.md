## PeriodO placename gazetteers

This repository contains custom placename gazetteers used for indicating the spatial coverage of PeriodO periods.

* Continents gazetteer:<br>
  https://data.perio.do/graphs/places/continents.json

* Regions gazetteer:<br>
  https://data.perio.do/graphs/places/regions.json

* Countries gazetteer:<br>
  https://data.perio.do/graphs/places/countries.json

* U.S. states gazetteer:<br>
  https://data.perio.do/graphs/places/us-states.json

* English counties gazetteer:<br>
  https://data.perio.do/graphs/places/english-counties.json

* Historical places gazetteer:<br>
  https://data.perio.do/graphs/places/historical.json

* All placename gazetteers:<br>
  https://data.perio.do/graphs/places/

* All graphs including placename gazetteers and the PeriodO dataset:<br>
  https://data.perio.do/graphs/


### Continents gazetteer

This gazetteer was created by querying Wikidata for instances of [Q5107 continent](https://www.wikidata.org/wiki/Q5107), then excluding [Australia](https://www.wikidata.org/wiki/Q3960) in favor of [Oceania](https://www.wikidata.org/wiki/Q538). It currently does not have any geometries.


### Regions gazetteer

This gazetteer was created by finding PeriodO periods with named regions in their spatial coverage descriptions, and then looking for close equivalents in Wikidata that are instances of [Q82794 geographic region](https://www.wikidata.org/wiki/Q82794). It currently does not have any geometries.


### Countries gazetteer

This gazetteer was created by:

1. merging the Natural Earth [1:110m](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/), [1:50m](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/), and [1:10m](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) cultural vectors for countries and map units, such that we use the lowest-resolution, and most geographically specific, country geometries available (i.e. prioritizing map units over sovereign entities).

1. removing Natural Earth "countries" that lack ISO country codes (see [jq/countries.jq](country-transform.jq) for the complete list). Natural Earth is missing ISO 3166-1 alpha-2 codes for Norway, Papua New Guinea, and Serbia, so these have been added.

1. using the ISO 3166-1 alpha-2 codes from the Natural Earth data to query Wikidata for the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).

The reason for the merging of countries and map units in step one is that in some cases (e.g. France) we want to separate the contiguous primary country geometry from the geometries of former colonial or territorial holdings around the world, and the procedure above achieves this. As a result the list also includes countries like Scotland and Wales, even though these are technically parts of the sovereign country of the United Kingdom.


### U.S. states gazetteer

This gazetteer was created by:

1. taking the [Natural Earth 1:110m cultural vectors](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/) for [U.S. states](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-1-states-provinces/) and

1. the geometries for U.S. unincorporated territories extracted from the merged Natural Earth cultural vectors for countries and map units (see [above](#present-day-countries-gazetteer)), and then

1. using the ISO 3166-2 (or, in the case of unincorporated territories, ISO 3166-1 alpha-2) codes from the Natural Earth data to query Wikidata for the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Historical places gazetteer

This gazetteer was created by finding PeriodO periods with named historical places in their spatial coverage descriptions, and then looking for close equivalents in Wikidata that are instances of [Q3024240 historical country](https://www.wikidata.org/wiki/Q3024240), [Q28171280 ancient civilization](https://www.wikidata.org/wiki/Q28171280), or [Q839954 archaeological site](https://www.wikidata.org/wiki/Q839954). It currently does not have any geometries.


### English counties gazetteer

This gazetteer was created by querying Wikidata for instances of [Q180673 ceremonial country of England](https://www.wikidata.org/wiki/Q180673). It currently does not have any geometries.
