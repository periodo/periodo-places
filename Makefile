ne_110m_%.zip:
	curl -L http://www.naturalearthdata.com/\
	http//www.naturalearthdata.com/download/110m/cultural/$@ > $@

ne_50m_%.zip:
	curl -L http://www.naturalearthdata.com/\
	http//www.naturalearthdata.com/download/50m/cultural/$@ > $@

ne_10m_%.zip:
	curl -L http://www.naturalearthdata.com/\
	http//www.naturalearthdata.com/download/10m/cultural/$@ > $@

%.shp: %.zip
	unzip $< $@

%.shx: %.zip
	unzip $< $@

%.dbf: %.zip
	unzip $< $@

%.prj: %.zip
	unzip $< $@

%.json: %.shp %.shx %.dbf %.prj
	ogr2ogr -f GeoJSON \
	-t_srs EPSG:4326 \
	-lco COORDINATE_PRECISION=6 \
	$@ $<

# prioritize lower-res over higher-res: 110m > 50m > 10m
# at each resolution, prioritize map_units over countries
countries-geometries.json: \
	ne_10m_admin_0_countries.json \
	ne_10m_admin_0_map_units.json \
	ne_50m_admin_0_countries.json \
	ne_50m_admin_0_map_units.json \
	ne_110m_admin_0_countries.json \
	ne_110m_admin_0_map_units.json
	jq -s -f countries-transform.jq $^ > $@

us-states-geometries.json: ne_110m_admin_1_states_provinces.json
	jq -f us-states-transform.jq $< > $@

countries-gazetteer.json: countries-geometries.json
	node build-gazetteer.js $< 'countries' > $@

us-states-gazetteer.json: us-states-geometries.json
	node build-gazetteer.js $< 'us-states' US > $@

periodo-dataset.json:
	curl -J -O https://data.perio.do/d.json

legacy-place-ids.txt: periodo-dataset.json
	jq -r -f extract-place-ids.jq $< | sort | uniq > $@

place-id-mappings.txt: legacy-place-ids.txt
	node map-legacy-ids.js $< > $@

all: countries-gazetteer.json us-states-gazetteer.json

stage: countries-gazetteer.json us-states-gazetteer.json
	periodo -s https://data.staging.perio.do\
	 update-graph countries-gazetteer.json places/countries
	periodo -s https://data.staging.perio.do\
	 update-graph us-states-gazetteer.json places/us-states

deploy: countries-gazetteer.json us-states-gazetteer.json
	periodo -s https://data.perio.do\
	 update-graph countries-gazetteer.json places/countries
	periodo -s https://data.perio.do\
	 update-graph us-states-gazetteer.json places/us-states

check: place-id-mappings.txt countries-gazetteer.json us-states-gazetteer.json
	node check-mapping.js $^

clean:
	rm -f *.zip *.shp *.shx *.dbf *.prj \
	ne_*.json *geometries.json *gazetteer.json \
	periodo-dataset.json legacy-place-ids.txt
