ne_110m_%.zip:
	curl -s -L http://www.naturalearthdata.com/\
	http//www.naturalearthdata.com/download/110m/cultural/$@ > $@

ne_50m_%.zip:
	curl -s -L http://www.naturalearthdata.com/\
	http//www.naturalearthdata.com/download/50m/cultural/$@ > $@

ne_10m_%.zip:
	curl -s -L http://www.naturalearthdata.com/\
	http//www.naturalearthdata.com/download/10m/cultural/$@ > $@

%.shp: %.zip
	unzip -q $< $@

%.shx: %.zip
	unzip -q $< $@

%.dbf: %.zip
	unzip -q $< $@

%.prj: %.zip
	unzip -q $< $@

%.json: %.shp %.shx %.dbf %.prj
	ogr2ogr -f GeoJSON \
	-t_srs EPSG:4326 \
	-lco COORDINATE_PRECISION=6 \
	$@ $<

# prioritize lower-res over higher-res: 110m > 50m > 10m
# at each resolution, prioritize map_units over countries
admin-0-geometries.json: \
	ne_10m_admin_0_countries.json \
	ne_10m_admin_0_map_units.json \
	ne_50m_admin_0_countries.json \
	ne_50m_admin_0_map_units.json \
	ne_110m_admin_0_countries.json \
	ne_110m_admin_0_map_units.json
	jq -s -f jq/admin-0.jq $^ > $@

admin-1-geometries.json: ne_110m_admin_1_states_provinces.json
	jq -f jq/admin-1.jq $< > $@

countries-geometries.json: admin-0-geometries.json
	jq -f jq/countries.jq $< > $@

us-territories-geometries.json: admin-0-geometries.json
	jq -f jq/us-territories.jq $< > $@

us-states-geometries.json: \
	admin-1-geometries.json us-territories-geometries.json
	jq -s '.[0] * .[1]' $^ > $@

%-gazetteer.json: %-geometries.json
	node build-gazetteer.js $< $* > $@

periodo-dataset.json:
	curl -s -J -O https://data.perio.do/d.json

legacy-place-ids.txt: periodo-dataset.json
	jq -r -f jq/periodo-place-ids.jq $< | sort | uniq > $@

place-id-mappings.txt: legacy-place-ids.txt
	node map-legacy-ids.js $< > $@

all: countries-gazetteer.json us-states-gazetteer.json historical-gazetteer.json

stage: \
	countries-gazetteer.json \
	us-states-gazetteer.json \
	historical-gazetteer.json
	periodo -s https://data.staging.perio.do\
	 update-graph countries-gazetteer.json places/countries
	periodo -s https://data.staging.perio.do\
	 update-graph us-states-gazetteer.json places/us-states
	periodo -s https://data.staging.perio.do\
	 update-graph historical-gazetteer.json places/historical

deploy: \
	countries-gazetteer.json \
	us-states-gazetteer.json \
	historical-gazetteer.json
	periodo -s https://data.perio.do\
	 update-graph countries-gazetteer.json places/countries
	periodo -s https://data.perio.do\
	 update-graph us-states-gazetteer.json places/us-states
	periodo -s https://data.perio.do\
	 update-graph historical-gazetteer.json places/historical

check: \
	place-id-mappings.txt \
	countries-gazetteer.json \
	us-states-gazetteer.json \
	historical-gazetteer.json
	node check-mapping.js $^

clean:
	rm -f *.zip *.shp *.shx *.dbf *.prj \
	ne_*.json countries-geometries.json us-states-geometries.json \
	*gazetteer.json periodo-dataset.json legacy-place-ids.txt
