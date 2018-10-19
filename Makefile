%.zip:
	curl -L http://www.naturalearthdata.com/\
	http//www.naturalearthdata.com/download/110m/cultural/$@ > $@

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

country-geometries.json: \
	ne_110m_admin_0_countries.json ne_110m_admin_0_map_units.json
	jq -s -f transform_ne_data.jq $^ > $@

country-gazetteer.json: country-geometries.json
	node build-gazetteer.js $< > $@

all: country-gazetteer.json

clean:
	rm -f *.zip *.shp *.shx *.dbf *.prj \
	ne_*.json *geometries.json *gazetteer.json
