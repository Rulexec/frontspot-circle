make: map/lib/geodesy.js
	cp node_modules/leaflet/dist/leaflet.js map/lib/leaflet.min.js
	cp node_modules/leaflet/dist/leaflet-src.js map/lib/leaflet.js
	cp node_modules/leaflet/dist/leaflet.css map/lib/leaflet.css
	cp node_modules/leaflet/dist/images -r map/lib/

npm:
	npm install

map/lib/geodesy.js: npm
	npm run deps
	cp dist/geodesy.js map/lib/geodesy.js

clean-geodesy:
	rm map/lib/geodesy.js
