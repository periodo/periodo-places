GAZETTEERS := \
	gazetteers/cities.json \
	gazetteers/continents.json \
	gazetteers/countries.json \
	gazetteers/english-counties.json \
	gazetteers/geographic-regions.json \
	gazetteers/greek-regions.json \
	gazetteers/historical.json \
	gazetteers/indian-states.json \
	gazetteers/italian-regions.json \
	gazetteers/other-regions.json \
	gazetteers/russian-federal-subjects.json \
	gazetteers/spanish-communities.json \
	gazetteers/subregions.json \
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

geometries/subregions/%.json: \
	place-ids/subregions.json \
	geometries/admin-0-and-western-russia.json
	mkdir -p geometries/subregions
	./sh/place.sh $^ $* > $@

geometries/cities.json: \
	place-ids/cities.json \
	geometries/urban-areas.json
	jq -r keys[] $< | ./sh/places.sh $^ | jq -s add > $@

geometries/cities/%.json: \
	place-ids/cities.json \
	geometries/urban-areas.json
	mkdir -p geometries/cities
	./sh/place.sh $^ $* > $@

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

geometries/greek-admin-1.json: \
	jq/greek-admin-1.jq \
	ne/ne_10m_admin_1_states_provinces.json
	mkdir -p geometries
	jq -f $^ > $@

geometries/greek-regions.json: \
	place-ids/greek-regions.json \
	geometries/greek-admin-1.json
	jq -r keys[] $< | ./sh/places.sh $^ | jq -s add > $@

geometries/greek-regions/%.json: \
	place-ids/greek-regions.json \
	geometries/greek-admin-1.json
	mkdir -p geometries/greek-regions
	./sh/place.sh $^ $* > $@

geometries/indian-admin-1.json: \
	jq/indian-admin-1.jq \
	ne/ne_10m_admin_1_states_provinces.json
	mkdir -p geometries
	jq -f $^ > $@

geometries/indian-states.json: \
	place-ids/indian-states.json \
	geometries/indian-admin-1.json
	jq -r keys[] $< | ./sh/places.sh $^ | jq -s add > $@

geometries/indian-states/%.json: \
	place-ids/indian-states.json \
	geometries/indian-admin-1.json
	mkdir -p geometries/indian-states
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

geometries/russian-admin-1.json: \
	jq/russian-admin-1.jq \
	ne/ne_10m_admin_1_states_provinces.json
	mkdir -p geometries
	jq -f $^ > $@

geometries/russian-federal-subjects.json: \
	place-ids/russian-federal-subjects.json \
	geometries/russian-admin-1.json
	jq -r keys[] $< | ./sh/places.sh $^ | jq -s add > $@

geometries/russian-federal-subjects/%.json: \
	place-ids/russian-federal-subjects.json \
	geometries/russian-admin-1.json
	mkdir -p geometries/russian-federal-subjects
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

geometries/geographic-regions.json: \
	place-ids/geographic-regions.json \
	geometries/scale-ranks-1-5.json
	jq -r keys[] $< | ./sh/places.sh $^ | jq -s add > $@

geometries/geographic-regions/%.json: \
	place-ids/geographic-regions.json \
	geometries/scale-ranks-1-5.json
	mkdir -p geometries/geographic-regions
	./sh/place.sh $^ $* > $@

geometries/countries.json: \
	jq/countries.jq \
	geometries/admin-0.json
	jq -f $^ > $@

geometries/us-territories.json: \
	jq/us-territories.jq \
	geometries/admin-0.json
	jq -f $^ > $@

geometries/us-admin-1.json: \
	jq/us-admin-1.jq \
	ne/ne_10m_admin_1_states_provinces.json
	mkdir -p geometries
	jq -f $^ > $@

geometries/us-states.json: \
	geometries/us-admin-1.json \
	geometries/us-territories.json
	jq -s '.[0] * .[1]' $^ > $@

geometries/%.json: place-ids/%.json
	mkdir -p geometries
	cat $< > $@

gazetteers/%.json: geometries/%.json
	mkdir -p gazetteers
	node js/build-gazetteer.js $< $* > $@

all: $(GAZETTEERS)

stage: all
	./sh/stage.sh

deploy: all
	./sh/deploy.sh

check: $(GAZETTEERS)
	curl -L -s https://data.perio.do/d.json | jq -r -f jq/periodo-place-ids.jq | sort | uniq | node js/check-gazetteers.js $^

clean:
	rm -rf \
	geometries \
	gazetteers

superclean: clean
	rm -rf ne
