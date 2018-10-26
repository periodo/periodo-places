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
country-geometries.json: \
	ne_10m_admin_0_countries.json \
	ne_10m_admin_0_map_units.json \
	ne_50m_admin_0_countries.json \
	ne_50m_admin_0_map_units.json \
	ne_110m_admin_0_countries.json \
	ne_110m_admin_0_map_units.json
	jq -s -f country-transform.jq $^ > $@

state-geometries.json: ne_110m_admin_1_states_provinces.json
	jq -f state-transform.jq $< > $@

country-gazetteer.json: country-geometries.json
	node build-gazetteer.js $< wd:Q6256 > $@

state-gazetteer.json: state-geometries.json
	node build-gazetteer.js $< wd:Q35657 US > $@

periodo-dataset.json:
	curl -J -O https://data.perio.do/d.json

legacy-place-ids.txt: periodo-dataset.json
	jq -r -f extract-place-ids.jq $< | sort | uniq > $@

place-id-mappings.txt: legacy-place-ids.txt
	node map-legacy-ids.js $< > $@

all: country-gazetteer.json state-gazetteer.json

check: place-id-mappings.txt country-gazetteer.json state-gazetteer.json
	node check-mapping.js $^

clean:
	rm -f *.zip *.shp *.shx *.dbf *.prj \
	ne_*.json *geometries.json *gazetteer.json \
	periodo-dataset.json legacy-place-ids.txt
