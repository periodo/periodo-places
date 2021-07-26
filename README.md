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

* **Algerian provinces gazetteer**<br>
  https://data.perio.do/graphs/places/algerian-provinces.json

* **English counties gazetteer**<br>
  https://data.perio.do/graphs/places/english-counties.json

* **Egyptian governorates gazetteer**<br>
  https://data.perio.do/graphs/places/egyptian-governorates.json

* **French regions gazetteer**<br>
  https://data.perio.do/graphs/places/french-regions.json

* **Greek administrative regions gazetteer**<br>
  https://data.perio.do/graphs/places/greek-regions.json

* **Indian states and union territories gazetteer**<br>
  https://data.perio.do/graphs/places/indian-states.json

* **Iranian provinces gazetteer**<br>
  https://data.perio.do/graphs/places/iranian-provinces.json

* **Italian regions gazetteer**<br>
  https://data.perio.do/graphs/places/italian-regions.json

* **Kuwaiti governorates gazetteer**<br>
  https://data.perio.do/graphs/places/kuwaiti-governorates.json

* **Laotian provinces gazetteer**<br>
  https://data.perio.do/graphs/places/laotian-provinces.json

* **Lebanese governorates gazetteer**<br>
  https://data.perio.do/graphs/places/lebanese-governorates.json

* **Libyan districts gazetteer**<br>
  https://data.perio.do/graphs/places/libyan-districts.json

* **Omani governorates gazetteer**<br>
  https://data.perio.do/graphs/places/omani-governorates.json

* **Pakistani provinces and territories gazetteer**<br>
  https://data.perio.do/graphs/places/pakistani-provinces.json

* **Russian federal subjects gazetteer**<br>
  https://data.perio.do/graphs/places/russian-federal-subjects.json

* **Saudi Arabian provinces gazetteer**<br>
  https://data.perio.do/graphs/places/saudi-arabian-provinces.json

* **Spanish autonomous communities gazetteer**<br>
  https://data.perio.do/graphs/places/spanish-communities.json

* **Syrian governorates gazetteer**<br>
  https://data.perio.do/graphs/places/syrian-governorates.json

* **Tajikistani regions gazetteer**<br>
  https://data.perio.do/graphs/places/tajikistani-regions.json

* **Turkish provinces gazetteer**<br>
  https://data.perio.do/graphs/places/turkish-provinces.json

* **Turkmen regions gazetteer**<br>
  https://data.perio.do/graphs/places/turkmen-regions.json

* **U.S. states gazetteer**<br>
  https://data.perio.do/graphs/places/us-states.json

* **Yemeni governorates gazetteer**<br>
  https://data.perio.do/graphs/places/yemeni-governorates.json

* **World cities gazetteer**<br>
  https://data.perio.do/graphs/places/cities.json

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


### Algerian provinces gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/algerian-provinces.json](place-ids/algerian-provinces.json) for details), and

1. querying Wikidata for instances of [Q240601 province of Algeria](https://www.wikidata.org/wiki/Q240601) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Egyptian governorates gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/egyptian-governorates.json](place-ids/egyptian-governorates.json) for details), and

1. querying Wikidata for instances of [Q204910 governorate of Egypt](https://www.wikidata.org/wiki/Q204910) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### English counties gazetteer

This gazetteer was created by:

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. merging geometries of the administrative units found in the Natural Earth data into geometries for (non-administrative) ceremonial counties (see [place-ids/english-counties.json](place-ids/english-counties.json) for details), and

1. querying Wikidata for instances of [Q180673 ceremonial country of England](https://www.wikidata.org/wiki/Q180673) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### French regions gazetteer

This gazetteer was created by:

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. merging geometries of the administrative units (departments) found in the Natural Earth data into geometries for (pre-2016) regions (see [place-ids/french-regions.json](place-ids/french-regions.json) for details), and

1. querying Wikidata for instances of [Q36784 region of France](https://www.wikidata.org/wiki/Q36784), [Q22670030 former French region](https://www.wikidata.org/wiki/Q22670030), or [Q202216 overseas department and region of France](https://www.wikidata.org/wiki/Q202216) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).

Note that these are the pre-2016 (22 metropolitan, 5 overseas) regions, not the current (13 metropolitan, 5 overseas) regions.


### Greek administrative regions gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/greek-regions.json](place-ids/greek-regions.json) for details), and

1. querying Wikidata for instances of [Q207299 administrative region of Greece](https://www.wikidata.org/wiki/Q207299) (or [Q788176 autonomous administrative territorial entity](https://www.wikidata.org/wiki/Q788176) in the case of the Monastic Republic of Mount Athos) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Indian states and union territories gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/indian-states.json](place-ids/indian-states.json) for details), and

1. querying Wikidata for instances of [Q131541 states and union territories of India](https://www.wikidata.org/wiki/Q131541) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).

Note that the state of Telangana (recently separated from Andhra Pradesh) and the union territory of Ladakh (recently separated from Jammu and Kashmir) are not included, as the geometries for these administrative units are not yet included in the Natural Earth data.


### Iranian provinces gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. merging geometries of the provinces found in the Natural Earth data into geometries for regions (see [place-ids/iranian-provinces.json](place-ids/iranian-provinces.json) for details), and

1. querying Wikidata for instances of [Q1344695 province of Iran](https://www.wikidata.org/wiki/Q1344695) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Iraqi and Kurdish governorates gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. merging geometries of the provinces found in the Natural Earth data into geometries for regions (see [place-ids/iraqi-governorates.json](place-ids/iraqi-governorates.json) for details), and

1. querying Wikidata for instances of [Q841753 governorate of Iraq](https://www.wikidata.org/wiki/Q841753) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).

Note that the governorate of Halabja, separated from the governorate of Sulaymaniyah in 2014, is not included, as the geometry for this administrative unit is not yet included in the Natural Earth data.


### Italian regions gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. merging geometries of the provinces found in the Natural Earth data into geometries for regions (see [place-ids/italian-regions.json](place-ids/italian-regions.json) for details), and

1. querying Wikidata for instances of [Q16110 region of Italy](https://www.wikidata.org/wiki/Q16110) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Kuwaiti governorates gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/kuwaiti-governorates.json](place-ids/kuwaiti-governorates.json) for details), and

1. querying Wikidata for instances of [Q842876 governorate of Kuwait](https://www.wikidata.org/wiki/Q842876) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Laotian provinces gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/laotian-provinces.json](place-ids/laotian-provinces.json) for details), and

1. querying Wikidata for instances of [Q15673297 province of Laos](https://www.wikidata.org/wiki/Q15673297) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).

Note that the province of Xaisomboun (recently established as a province, having been a special administrative zone) is not included, as the geometry for this administrative unit is not yet included in the Natural Earth data.


### Lebanese governorates gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/lebanese-governorates.json](place-ids/lebanese-governorates.json) for details), and

1. querying Wikidata for instances of [Q844713 governorate of Lebanon](https://www.wikidata.org/wiki/Q844713) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).

Note that the post-2014 provinces of Akkar, Baalbek-Hermel, and Keserwan-Jbeil are not included, as the geometries for these administrative units are not yet included in the Natural Earth data.


### Libyan districts gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/libyan-districts.json](place-ids/libyan-districts.json) for details), and

1. querying Wikidata for instances of [Q48242 district of Libya](https://www.wikidata.org/wiki/Q48242) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Omani governorates gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/omani-governorates.json](place-ids/omani-governorates.json) for details), and

1. querying Wikidata for instances of [Q641078 governorate of Oman](https://www.wikidata.org/wiki/Q641078) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Pakistani provinces gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/pakistani-provinces.json](place-ids/pakistani-provinces.json) for details), and

1. querying Wikidata for instances of [Q270496 administrative territorial entity of Pakistan](https://www.wikidata.org/wiki/Q270496) that are also instances of [Q10864048 first-level administrative country subdivision](https://www.wikidata.org/wiki/Q10864048) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).

Note that the Federally Administered Tribal Areas are included as a separate territory, as theywere prior to their 2018 merger with the province of Khyber Pakhtunkhwa.


### Russian federal subjects gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/russian-federal-subjects.json](place-ids/russian-federal-subjects.json) for details), and

1. querying Wikidata for instances of [Q43263 federal subject of Russia](https://www.wikidata.org/wiki/Q43263) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Saudi Arabian provinces gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/saudi-arabian-provinces.json](place-ids/saudi-arabian-provinces.json) for details), and

1. querying Wikidata for instances of [Q15623255 administrative territorial entity of Saudi Arabia](https://www.wikidata.org/wiki/Q15623255) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Spanish autonomous communities gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. merging geometries of the units found in the Natural Earth data into geometries for autonomous communities (see [place-ids/spanish-communities.json](place-ids/spanish-communities.json) for details), and

1. querying Wikidata for instances of [Q10742 autonomous community of Spain](https://www.wikidata.org/wiki/Q10742) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Syrian governorates gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/syrian-governorates.json](place-ids/syrian-governorates.json) for details), and

1. querying Wikidata for instances of [Q517351 governorate of Syria](https://www.wikidata.org/wiki/Q517351) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Tajikistani regions gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/tajikistani-regions.json](place-ids/tajikistani-regions.json) for details), and

1. querying Wikidata for instances of [Q867545 region of Tajikistan](https://www.wikidata.org/wiki/Q867545) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Turkish provinces gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/turkish-provinces.json](place-ids/turkish-provinces.json) for details), and

1. querying Wikidata for instances of [Q48336 province of Turkey](https://www.wikidata.org/wiki/Q48336) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Turkmen regions gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/turkmen-regions.json](place-ids/turkmen-regions.json) for details), and

1. querying Wikidata for instances of [Q12014176 region of Turkmenistan](https://www.wikidata.org/wiki/Q12014176) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### U.S. states gazetteer

This gazetteer was created by:

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [U.S. states](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/) and

1. the geometries for U.S. unincorporated territories extracted from the merged Natural Earth cultural vectors for countries and map units (see [above](#present-day-countries-gazetteer)), and then

1. using the ISO 3166-2 (or, in the case of unincorporated territories, ISO 3166-1 alpha-2) codes from the Natural Earth data to query Wikidata for the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).


### Yemeni governorates gazetteer

1. taking the [Natural Earth 1:10m cultural vectors](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) for [states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/),

1. extracting geometries of the administrative regions from the Natural Earth data (see [place-ids/yemeni-governorates.json](place-ids/yemeni-governorates.json) for details), and

1. querying Wikidata for instances of [Q331130 governorate of Yemen](https://www.wikidata.org/wiki/Q331130) to add the additional metadata required by the [Linked Places gazetteer format](https://github.com/LinkedPasts/linked-places#the-linked-places-format).

Note that this gazetteer includes the Socotra Archipelago as part of the Hadhramaut Governorate, as it was prior to 2014.


### World cities gazetteer

This gazetteer was created by:

1. finding PeriodO periods with cities in their spatial coverage descriptions, and then looking for close equivalents in Wikidata that are instances of [Q486972 human settlement](https://www.wikidata.org/wiki/Q486972), and then

1. using the [Natural Earth 1:10m landscan urban areas](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/) to derive geometries for these cities (see [place-ids/cities.json](place-ids/cities.json) for the mapping from Wikidata names to NE names).


### Historical places gazetteer

This gazetteer was created by finding PeriodO periods with named historical places in their spatial coverage descriptions, and then looking for close equivalents in Wikidata that are instances of [Q3024240 historical country](https://www.wikidata.org/wiki/Q3024240), [Q28171280 ancient civilization](https://www.wikidata.org/wiki/Q28171280), or [Q839954 archaeological site](https://www.wikidata.org/wiki/Q839954). It currently does not have any geometries.
