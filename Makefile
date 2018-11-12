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
	ne/ne_110m_geography_regions_polys.json
	jq -f jq/continents.jq $< > $@

geometries/continents-oceania.json: \
	ne/ne_110m_geography_regions_polys.json
	jq -f jq/oceania.jq $< \
	| $(NM)geojson-clipping union \
	| jq '{Oceania: {geometry}}' \
	> $@

geometries/continents-asia.json: \
	ne/ne_110m_geography_regions_polys.json
	jq -f jq/asia.jq $< \
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
	ne/ne_10m_admin_0_countries.json \
	ne/ne_10m_admin_0_map_units.json \
	ne/ne_50m_admin_0_countries.json \
	ne/ne_50m_admin_0_map_units.json \
	ne/ne_110m_admin_0_countries.json \
	ne/ne_110m_admin_0_map_units.json
	jq -s -f jq/admin-0.jq $^ > $@

geometries/admin-1.json: ne/ne_110m_admin_1_states_provinces.json
	jq -f jq/admin-1.jq $< > $@

geometries/countries.json: geometries/admin-0.json
	jq -f jq/countries.jq $< > $@

geometries/us-territories.json: geometries/admin-0.json
	jq -f jq/us-territories.jq $< > $@

geometries/us-states.json: \
	geometries/admin-1.json geometries/us-territories.json
	jq -s '.[0] * .[1]' $^ > $@

gazetteers/%.json: geometries/%.json
	node js/build-gazetteer.js $< $* > $@

periodo-dataset.json:
	curl -s -J -O https://data.perio.do/d.json

legacy-place-ids.txt: periodo-dataset.json
	jq -r -f jq/periodo-place-ids.jq $< | sort | uniq > $@

place-id-mappings.txt: legacy-place-ids.txt
	node js/map-legacy-ids.js $< > $@

all: $(GAZETTEERS)

stage: all
	./stage.sh

deploy: all
	./deploy.sh

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
