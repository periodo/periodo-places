GAZETTEERS := \
	gazetteers/algerian-provinces.json \
	gazetteers/azerbaijani-districts.json \
	gazetteers/beninese-departments.json \
	gazetteers/bolivian-departments.json \
	gazetteers/burkinabe-regions.json \
	gazetteers/cities.json \
	gazetteers/continents.json \
	gazetteers/countries.json \
	gazetteers/djiboutian-regions.json \
	gazetteers/egyptian-governorates.json \
	gazetteers/english-counties.json \
	gazetteers/ethiopian-regions.json \
	gazetteers/french-regions.json \
	gazetteers/gambian-regions.json \
	gazetteers/geographic-regions.json \
	gazetteers/georgian-regions.json \
	gazetteers/greek-regions.json \
	gazetteers/guinean-regions.json \
	gazetteers/historical.json \
	gazetteers/indian-states.json \
	gazetteers/indonesian-provinces.json \
	gazetteers/iranian-provinces.json \
	gazetteers/iraqi-governorates.json \
	gazetteers/israeli-districts.json \
	gazetteers/italian-regions.json \
	gazetteers/jordanian-governorates.json \
	gazetteers/kyrgyz-regions.json \
	gazetteers/kuwaiti-governorates.json \
	gazetteers/laotian-provinces.json \
	gazetteers/lebanese-governorates.json \
	gazetteers/libyan-districts.json \
	gazetteers/malaysian-states.json \
	gazetteers/myanma-states.json \
	gazetteers/nigerian-states.json \
	gazetteers/nigerien-regions.json \
	gazetteers/omani-governorates.json \
	gazetteers/other-regions.json \
	gazetteers/pakistani-provinces.json \
	gazetteers/philippine-regions.json \
	gazetteers/russian-federal-subjects.json \
	gazetteers/saudi-arabian-provinces.json \
	gazetteers/spanish-communities.json \
	gazetteers/subregions.json \
	gazetteers/sudanese-states.json \
	gazetteers/syrian-governorates.json \
	gazetteers/tajikistani-regions.json \
	gazetteers/thai-provinces.json \
	gazetteers/turkish-provinces.json \
	gazetteers/turkmen-regions.json \
	gazetteers/ukrainian-oblasts.json \
	gazetteers/us-states.json \
	gazetteers/uzbek-regions.json \
	gazetteers/vietnamese-provinces.json \
	gazetteers/yemeni-governorates.json

NM := ./node_modules/.bin/

ne/%.zip:
	mkdir -p ne
	curl -s -L  $(shell node js/natural-earth-url.js $@) > $@

ne/%.shp: ne/%.zip
	unzip -q -d ne $< $*.shp

ne/%.shx: ne/%.zip
	unzip -q -d ne $< $*.shx

ne/%.dbf: ne/%.zip
	unzip -q -d ne $< $*.dbf

ne/%.prj: ne/%.zip
	unzip -q -d ne $< $*.prj

ne/%.json: ne/%.shp ne/%.shx ne/%.dbf ne/%.prj
	ogr2ogr -f GeoJSON \
	-t_srs EPSG:4326 \
	-lco COORDINATE_PRECISION=6 \
	$@ $<

# Prioritize lower resolutions over higher resolutions at each
# resolution, and prioritize map units over countries. This avoids
# weird hulls due to distant colonies or far offshore islands.
geometries/admin-0.json: \
	jq/admin-0.jq \
	ne/ne_10m_admin_0_countries.json \
	ne/ne_10m_admin_0_map_units.json \
	ne/ne_50m_admin_0_countries.json \
	ne/ne_50m_admin_0_map_units.json \
	ne/ne_110m_admin_0_countries.json \
	ne/ne_110m_admin_0_map_units.json
	mkdir -p geometries
	jq -s -f $^ > $@

geometries/scale-rank-0.json: \
	jq/scale-rank-0.jq \
	ne/ne_10m_geography_regions_polys.json
	mkdir -p geometries
	jq -f $^ > $@

geometries/scale-ranks-1-5.json: \
	jq/scale-ranks-1-5.jq \
	ne/ne_10m_geography_regions_polys.json
	mkdir -p geometries
	jq -f $^ > $@

geometries/urban-areas.json: \
	jq/urban-areas.jq \
	ne/ne_10m_urban_areas_landscan.json
	mkdir -p geometries
	jq -f $^ > $@

geometries/10m-admin-0.json: \
	jq/admin-0.jq \
	ne/ne_10m_admin_0_countries.json \
	ne/ne_10m_admin_0_map_units.json
	jq -s -f $^ > $@

geometries/western-russia.json: \
	jq/western-russia.jq \
	ne/ne_10m_admin_0_scale_rank.json
	mkdir -p geometries
	jq -f $^ \
	| $(NM)/geojson-clipping union \
	| jq '{"Western Russia":{geometry}}' > $@

geometries/admin-0-and-western-russia.json: \
	geometries/10m-admin-0.json \
	geometries/western-russia.json
	jq -s '.[0] * .[1]' $^ > $@

geometries/subregions.json: \
	place-ids/subregions.json \
	geometries/admin-0-and-western-russia.json
	jq -r keys[] $< | ./sh/places.sh $^ | jq -s add > $@

geometries/cities.json: \
	place-ids/cities.json \
	geometries/urban-areas.json
	jq -r keys[] $< | ./sh/places.sh $^ | jq -s add > $@

geometries/continents.json: \
	place-ids/continents.json \
	geometries/scale-rank-0.json
	jq -r keys[] $< | ./sh/places.sh $^ | jq -s add > $@

geometries/geographic-regions.json: \
	place-ids/geographic-regions.json \
	geometries/scale-ranks-1-5.json
	jq -r keys[] $< | ./sh/places.sh $^ | jq -s add > $@

geometries/countries.json: \
	jq/countries.jq \
	geometries/admin-0.json
	jq -f $^ > $@

geometries/us-territories.json: \
	jq/us-territories.jq \
	geometries/admin-0.json
	jq -f $^ > $@

geometries/us-states.json: \
	geometries/us-admin-1.json \
	geometries/us-territories.json
	jq -s '.[0] * .[1]' $^ > $@

geometries/historical.json: place-ids/historical.json
	mkdir -p geometries
	cat $< > $@

geometries/other-regions.json: place-ids/other-regions.json
	mkdir -p geometries
	cat $< > $@

geometries/%-admin-1.json: \
	jq/%-admin-1.jq \
	ne/ne_10m_admin_1_states_provinces.json
	mkdir -p geometries
	jq -f $^ > $@

.SECONDEXPANSION:
geometries/%.json: \
	place-ids/%.json \
	geometries/$$(firstword $$(subst -, ,$$*))-admin-1.json
	jq -r keys[] $< | ./sh/places.sh $^ | jq -s add > $@

gazetteers/%.json: geometries/%.json
	mkdir -p gazetteers
	node js/build-gazetteer.js $< $* > $@

.PHONY: all stage deploy check clean superclean

all: $(GAZETTEERS)

stage: all
	./sh/stage.sh

deploy: all
	./sh/deploy.sh

check: $(GAZETTEERS)
	curl -L -s https://data.perio.do/d.json \
	| jq -r -f jq/periodo-place-ids.jq \
	| sort | uniq \
	| node js/check-gazetteers.js $^

clean:
	rm -rf \
	geometries \
	gazetteers

superclean: clean
	rm -rf ne
