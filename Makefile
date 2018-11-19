GAZETTEERS := \
	gazetteers/cities.json \
	gazetteers/continents.json \
	gazetteers/countries.json \
	gazetteers/english-counties.json \
	gazetteers/historical.json \
	gazetteers/italian-regions.json \
	gazetteers/regions.json \
	gazetteers/spanish-communities.json \
	gazetteers/us-states.json

NM := ./node_modules/.bin/

ne:
	mkdir ne

ne/%.zip: ne
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

geometries/continents-except-asia-and-oceania.json: \
	jq/continents.jq \
	ne/ne_110m_geography_regions_polys.json
	jq -f $^ > $@

geometries/continents-oceania.json: \
	jq/oceania.jq \
	ne/ne_110m_geography_regions_polys.json
	jq -f $^ \
	| $(NM)geojson-clipping union \
	| jq '{Oceania: {geometry}}' \
	> $@

geometries/continents-asia.json: \
	jq/asia.jq \
	ne/ne_110m_geography_regions_polys.json
	jq -f $^ \
	| $(NM)geojson-clipping union \
	| jq '{Asia: {geometry}}' \
	> $@

geometries/continents.json: \
	geometries/continents-ids.json \
	geometries/continents-asia.json \
	geometries/continents-oceania.json \
	geometries/continents-except-asia-and-oceania.json
	jq -s '.[0] * .[1] * .[2] * .[3]' $^ > $@

# prioritize lower-res over higher-res: 110m > 50m > 10m
# at each resolution, prioritize map_units over countries
geometries/admin-0.json: \
	jq/admin-0.jq \
	ne/ne_10m_admin_0_countries.json \
	ne/ne_10m_admin_0_map_units.json \
	ne/ne_50m_admin_0_countries.json \
	ne/ne_50m_admin_0_map_units.json \
	ne/ne_110m_admin_0_countries.json \
	ne/ne_110m_admin_0_map_units.json
	jq -s -f $^ > $@

geometries/admin-1.json: \
	jq/admin-1.jq \
	ne/ne_110m_admin_1_states_provinces.json
	jq -f $^ > $@

geometries/english-admin-1.json: \
	jq/english-admin-1.jq \
	ne/ne_10m_admin_1_states_provinces.json
	jq -f $^ > $@

geometries/english-counties.json: \
	geometries/english-counties-ids.json \
	geometries/english-admin-1.json
	jq -r keys[] $< | ./sh/english-counties.sh | jq -s add > $@

geometries/english-counties:
	mkdir -p $@

geometries/english-counties/%.json: \
	geometries/english-counties-ids.json \
	geometries/english-admin-1.json \
	geometries/english-counties
	./sh/english-county.sh $* > $@

geometries/countries.json: \
	jq/countries.jq \
	geometries/admin-0.json
	jq -f $^ > $@

geometries/us-territories.json: \
	jq/us-territories.jq \
	geometries/admin-0.json
	jq -f $^ > $@

geometries/us-states.json: \
	geometries/admin-1.json geometries/us-territories.json
	jq -s '.[0] * .[1]' $^ > $@

gazetteers/%.json: geometries/%.json
	node js/build-gazetteer.js $< $* > $@

periodo-dataset.json:
	curl -s -J -O https://data.perio.do/d.json

legacy-place-ids.txt: jq/periodo-place-ids.jq periodo-dataset.json
	jq -r -f $^ | sort | uniq > $@

place-id-mappings.txt: legacy-place-ids.txt
	node js/map-legacy-ids.js $< > $@

all: $(GAZETTEERS)

stage: all
	./sh/stage.sh

deploy: all
	./sh/deploy.sh

check: place-id-mappings.txt $(GAZETTEERS)
	node js/check-mapping.js $^

clean:
	rm -f *.shp *.shx *.dbf *.prj \
	geometries/admin-0.json \
	geometries/admin-1.json \
	geometries/continents-asia.json \
	geometries/continents-except-asia-and-oceania.json \
	geometries/continents-oceania.json \
	geometries/continents.json \
	geometries/countries.json \
	geometries/english-admin-1.json \
	geometries/english-counties/*.json \
	geometries/english-counties.json \
	geometries/us-states.json \
	geometries/us-territories.json \
	gazetteers/*.json periodo-dataset.json \
	legacy-place-ids.txt place-id-mappings.txt

superclean: clean
	rm -rf ne

europe:
	jq -f jq/europe.jq geometries/countries.json \
	| ./node_modules/.bin/geojson-clipping union \
	| ./node_modules/.bin/geojsonio
