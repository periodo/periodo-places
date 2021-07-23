## PeriodO placename gazetteers

This repository contains custom placename gazetteers used for indicating the spatial coverage of PeriodO periods. Gazetteers in bold have geometry (boundary polygon) information. To keep these gazetteers as small as possible, and to communicate the sense in which we use them, the published geometries are [convex hulls](https://en.wikipedia.org/wiki/Convex_hull) of the more detailed boundary polygons.

* **Continents gazetteer**<br>
  https://data.perio.do/graphs/places/continents.json

* **Subcontintental regions gazetteer**<br>
  https://data.perio.do/graphs/places/subregions.json

* **Geographic regions gazetteer**<br>
  https://data.perio.do/graphs/places/geographic-regions.json

* Other regions gazetteer<br>
  https://data.perio.do/graphs/places/other-regions.json

* **Countries gazetteer**<br>
  https://data.perio.do/graphs/places/countries.json

* **World cities gazetteer**<br>
  https://data.perio.do/graphs/places/cities.json

* **U.S. states gazetteer**<br>
  https://data.perio.do/graphs/places/us-states.json

* **English counties gazetteer**<br>
  https://data.perio.do/graphs/places/english-counties.json

* **Greek administrative regions gazetteer**<br>
  https://data.perio.do/graphs/places/greek-regions.json

* **Italian regions gazetteer**<br>
  https://data.perio.do/graphs/places/italian-regions.json

* **Indian states and union territories gazetteer**<br>
  https://data.perio.do/graphs/places/indian-states.json

* **Laotian provinces gazetteer**<br>
  https://data.perio.do/graphs/places/laotian-provinces.json

* **Russian federal subjects gazetteer**<br>
  https://data.perio.do/graphs/places/russian-federal-subjects.json

* **Spanish autonomous communities gazetteer**<br>
  https://data.perio.do/graphs/places/spanish-communities.json

* Historical places gazetteer<br>
  https://data.perio.do/graphs/places/historical.json

* All placename gazetteers<br>
  https://data.perio.do/graphs/places.json

* All graphs including placename gazetteers and the PeriodO dataset<br>
  https://data.perio.do/graphs.json


### Continents gazetteer

This gazetteer was created by:

1. taking continent geometries from the [Natural Earth 1:10m physical vectors for label areas](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-physical-labels/), merging the geometries for Asia and the Malay Archipelago to get a broader geometry for Asia, and merging the geometries for the scale rank 0 areas in the Oceania region to get a geometry for Oceania,

1. querying Wikidata for instances of [Q5107 continent](https://www.wikidata.org/wiki/Q5107), excluding [Q3960 Australia](https://www.wikidata.org/wiki/Q3960) in favor of [Q538 Oceania](https://www.wikidata.org/wiki/Q538). This gazetteer is also where we put [Q2 Earth](https://www.wikidata.org/wiki/Q2), for lack of a better place. (Earth does not have a geometry.)


### Subcontinental regions gazetteer

1. merging the Natural Earth [1:10m](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) cultural vectors for countries and map units (prioritizing map units over sovereign entities),

1. merging geometries of the units found in the Natural Earth data into geometries for subcontinental regions (see [place-ids/subregions.json](place-ids/subregions.json) for details), and

1. querying Wikidata for instances of [Q82794 geographic region](https://www.wikidata.org/wiki/Q82794) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Geographic regions gazetteer

This gazetteer was created by:

1. finding PeriodO periods with geographic regions in their spatial coverage descriptions, and then looking for close equivalents in Wikidata that are instances of [Q82794 geographic region](https://www.wikidata.org/wiki/Q82794), and then

1. taking region geometries from the [Natural Earth 1:10m physical vectors for label areas](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-physical-labels/).


### Other regions gazetteer

This gazetteer was created by finding PeriodO periods with miscellaneous regions in their spatial coverage descriptions, and then looking for close equivalents in Wikidata that are instances of [Q82794 geographic region](https://www.wikidata.org/wiki/Q82794). It currently does not have any geometries.


### Countries gazetteer

This gazetteer was created by:

1. merging the Natural Earth [1:110m](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/), [1:50m](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/), and [1:10m](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) cultural vectors for countries and map units, such that we use the lowest-resolution, and most geographically specific, country geometries available (i.e. prioritizing map units over sovereign entities).

1. removing Natural Earth "countries" that lack ISO country codes (see [jq/countries.jq](jq/countries.jq) for the complete list). Natural Earth is missing ISO 3166-1 alpha-2 codes for Norway, Papua New Guinea, and Serbia, so these have been added.

1. using the ISO 3166-1 alpha-2 codes from the Natural Earth data to query Wikidata for the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).

The reason for the merging of countries and map units in step one is that in some cases (e.g. France) we want to separate the contiguous primary country geometry from the geometries of former colonial or territorial holdings around the world, and the procedure above achieves this. As a result the list also includes countries like Scotland and Wales, even though these are technically parts of the sovereign country of the United Kingdom.


### World cities gazetteer

This gazetteer was created by:

1. finding PeriodO periods with cities in their spatial coverage descriptions, and then looking for close equivalents in Wikidata that are instances of [Q486972 human settlement](https://www.wikidata.org/wiki/Q486972), and then

1. using the [Natural Earth 1:10m landscan urban areas](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/) to derive geometries for these cities (see [place-ids/cities.json](place-ids/cities.json) for the mapping from Wikidata names to NE names).


### U.S. states gazetteer

This gazetteer was created by:

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [U.S. states](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/) and

1. the geometries for U.S. unincorporated territories extracted from the merged Natural Earth cultural vectors for countries and map units (see [above](#present-day-countries-gazetteer)), and then

1. using the ISO 3166-2 (or, in the case of unincorporated territories, ISO 3166-1 alpha-2) codes from the Natural Earth data to query Wikidata for the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### English counties gazetteer

This gazetteer was created by:

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. merging geometries of the administrative units found in the Natural Earth data into geometries for (non-administrative) ceremonial counties (see [place-ids/english-counties.json](place-ids/english-counties.json) for details), and

1. querying Wikidata for instances of [Q180673 ceremonial country of England](https://www.wikidata.org/wiki/Q180673) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Greek administrative regions gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/greek-regions.json](place-ids/greek-regions.json) for details), and

1. querying Wikidata for instances of [Q207299 administrative region of Greece](https://www.wikidata.org/wiki/Q207299) (or [Q788176 autonomous administrative territorial entity](https://www.wikidata.org/wiki/Q788176) in the case of the Monastic Republic of Mount Athos) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Indian states and union territories gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/indian-states.json](place-ids/indian-states.json) for details), and

1. querying Wikidata for instances of [Q131541 states and union territories of India](https://www.wikidata.org/wiki/Q131541) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).

Note that the state of Telangana (recently separated from Andhra Pradesh) and the union territory of Ladakh (recently separated from Jammu and Kashmir) are not included, as the geometries for these administrative units are not yet included in the Natural Earth data.

### Italian regions gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. merging geometries of the provinces found in the Natural Earth data into geometries for regions (see [place-ids/italian-regions.json](place-ids/italian-regions.json) for details), and

1. querying Wikidata for instances of [Q16110 region of Italy](https://www.wikidata.org/wiki/Q16110) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Laotian provinces gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/laotian-provinces.json](place-ids/laotian-provinces.json) for details), and

1. querying Wikidata for instances of [Q15673297 province of Laos](https://www.wikidata.org/wiki/Q15673297) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).

Note that the province of Xaisomboun (recently established as a province, having been a special administrative zone) is not included, as the geometry for this administrative unit is not yet included in the Natural Earth data.


### Russian federal subjects gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/russian-federal-subjects.json](place-ids/russian-federal-subjects.json) for details), and

1. querying Wikidata for instances of [Q43263 federal subject of Russia](https://www.wikidata.org/wiki/Q43263) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Spanish autonomous communities gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. merging geometries of the units found in the Natural Earth data into geometries for autonomous communities (see [place-ids/spanish-communities.json](place-ids/spanish-communities.json) for details), and

1. querying Wikidata for instances of [Q10742 autonomous community of Spain](https://www.wikidata.org/wiki/Q10742) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Historical places gazetteer

This gazetteer was created by finding PeriodO periods with named historical places in their spatial coverage descriptions, and then looking for close equivalents in Wikidata that are instances of [Q3024240 historical country](https://www.wikidata.org/wiki/Q3024240), [Q28171280 ancient civilization](https://www.wikidata.org/wiki/Q28171280), or [Q839954 archaeological site](https://www.wikidata.org/wiki/Q839954). It currently does not have any geometries.


