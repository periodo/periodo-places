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
	mkdir -p geometries
	jq -s -f $^ > $@

geometries/admin-1.json: \
	jq/admin-1.jq \
	ne/ne_110m_admin_1_states_provinces.json
	mkdir -p geometries
	jq -f $^ > $@

geometries/scale-rank-0.json: \
	jq/scale-rank-0.jq \
	ne/ne_110m_geography_regions_polys.json
	mkdir -p geometries
	jq -f $^ > $@

geometries/english-admin-1.json: \
	jq/english-admin-1.jq \
	ne/ne_10m_admin_1_states_provinces.json
	mkdir -p geometries
	jq -f $^ > $@

geometries/english-counties.json: \
	place-ids/english-counties.json \
	geometries/english-admin-1.json
	jq -r keys[] $< | ./sh/places.sh $^ | jq -s add > $@

geometries/english-counties/%.json: \
	place-ids/english-counties.json \
	geometries/english-admin-1.json
	mkdir -p geometries/english-counties
	./sh/place.sh $^ $* > $@

geometries/italian-admin-1.json: \
	jq/italian-admin-1.jq \
	ne/ne_10m_admin_1_states_provinces.json
	mkdir -p geometries
	jq -f $^ > $@

geometries/italian-regions.json: \
	place-ids/italian-regions.json \
	geometries/italian-admin-1.json
	jq -r keys[] $< | ./sh/places.sh $^ | jq -s add > $@

geometries/italian-regions/%.json: \
	place-ids/italian-regions.json \
	geometries/italian-admin-1.json
	mkdir -p geometries/italian-regions
	./sh/place.sh $^ $* > $@

geometries/spanish-admin-1.json: \
	jq/spanish-admin-1.jq \
	ne/ne_10m_admin_1_states_provinces.json
	mkdir -p geometries
	jq -f $^ > $@

geometries/spanish-communities.json: \
	place-ids/spanish-communities.json \
	geometries/spanish-admin-1.json
	jq -r keys[] $< | ./sh/places.sh $^ | jq -s add > $@

geometries/spanish-communities/%.json: \
	place-ids/spanish-communities.json \
	geometries/spanish-admin-1.json
	mkdir -p geometries/spanish-communities
	./sh/place.sh $^ $* > $@

geometries/continents.json: \
	place-ids/continents.json \
	geometries/scale-rank-0.json
	jq -r keys[] $< | ./sh/places.sh $^ | jq -s add > $@

geometries/continents/%.json: \
	place-ids/continents.json \
	geometries/scale-rank-0.json
	mkdir -p geometries/continents
	./sh/place.sh $^ $* > $@

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

geometries/%.json: place-ids/%.json
	mkdir -p geometries
	cat $< > $@

gazetteers/%.json: geometries/%.json
	mkdir -p gazetteers
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
	rm -rf \
	geometries \
	gazetteers \
	periodo-dataset.json \
	legacy-place-ids.txt \
	place-id-mappings.txt

superclean: clean
	rm -rf ne
