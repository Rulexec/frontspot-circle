(function(){

function Map(options) {
	var cssWidth = options && options.width || '100%',
	    cssHeight = options && options.height || '100%';

	var self = this;

	var element = document.createElement('div');

	element.style.width = cssWidth;
	element.style.height = cssHeight;

	var map = L.map(element, {
		trackResize: false,

		inertia: false, // TODO: dynamic control by `followingUnit`
		scrollWheelZoom: 'center', // TODO: dynamic control by `followingUnit`

		zoomControl: false
	});

	var zoomControl = L.control.zoom();

	map.setView([51.505, -0.09], 13);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	var followingUnit = null,
	    isHidden = true;

	map.on('dragend', function(e) {
		if (followingUnit) {
			self.setCenter(followingUnit.getPosition());
		}
	});

	this.getElement = function() { return element; };

	this.onShown = function() {
		isHidden = false;
		map.invalidateSize();
	};
	this.onResize = function() {
		map.invalidateSize();
	};

	this.onHidden = function() {
		isHidden = true;

		// TODO: unsubscribe from events, stop map updating
	};

	this.getCenter = function() {
		var latLng = map.getCenter();
		return { lat: latLng.lat, lon: latLng.lng };
	};
	this.setCenter = function(pos) {
		map.setView(pos);
	};

	this.addUnit = function(unit) {
		//var unitMarker = L.marker([51.5, -0.09]).addTo(map);
		var unitMarker = null;

		var removed = false;

		var positionWatcher = unit.watchPosition(function(pos, posOptions) {
			if (removed) { console.warn('Unit is removed'); return; }

			if (!pos) {
				if (unitMarker) {
					unitMarker.remove();
					unitMarker = null;
				}
				return;
			}

			if (!unitMarker) {
				unitMarker = L.marker(pos, {
					rotationOrigin: '50% 50%'
				}).addTo(map);
			} else {
				unitMarker.setLatLng(pos);
			}

			if (followingUnit === unit) {
				self.setCenter(unit.getPosition());
			}
		});

		var controller = {
			follow: function() {
				if (removed) { console.warn('Unit is removed'); return; }

				self.setCenter(unit.getPosition());

				followingUnit = unit;
			},
			remove: function() {
				if (removed) { console.warn('Unit is removed'); return; }

				removed = true;

				if (positionWatcher) { positionWatcher.cancel(); positionWatcher = null; }
				if (unitMarker) { unitMarker.remove(); unitMarker = null; }
			}
		};

		return controller;
	};

	this.startCircleDrawing = function(options) {
		var center = options.center,
		    radius = options.radius;

		var radiusPoint = new FrontSpotGeodesy.LatLonEllipsoidal(center.lat, center.lon);
		radiusPoint = radiusPoint.destinationPoint(radius, 135);

		var circle = new L.Circle(center, { radius: radius });
		var centerMarker = new L.Marker(center, {
			draggable: true
		});
		var radiusMarker = new L.Marker({ lat: radiusPoint.lat, lon: radiusPoint.lon }, {
			draggable: true
		});

		centerMarker.on('drag', function(e) {
			var oldLatLng = circle.getLatLng();

			circle.setLatLng(e.latlng);

			// Calculate radius marker old bearing
			var radiusLatLng = radiusMarker.getLatLng();

			var centerPoint = new FrontSpotGeodesy.LatLonEllipsoidal(oldLatLng.lat, oldLatLng.lng),
			    radiusPoint = new FrontSpotGeodesy.LatLonEllipsoidal(radiusLatLng.lat, radiusLatLng.lng);

			var radiusPointBearing = centerPoint.initialBearingTo(radiusPoint);

			// Move radius marker
			var point = new FrontSpotGeodesy.LatLonEllipsoidal(e.latlng.lat, e.latlng.lng);
			var newRadiusPoint = point.destinationPoint(circle.getRadius(), radiusPointBearing);

			radiusMarker.setLatLng({lat: newRadiusPoint.lat, lon: newRadiusPoint.lon});
		});
		radiusMarker.on('drag', function(e) {
			var centerLatLng = circle.getLatLng();

			var newRadius = e.latlng.distanceTo(centerLatLng);

			circle.setRadius(newRadius);
		});

		circle.addTo(map);
		centerMarker.addTo(map);
		radiusMarker.addTo(map);

		return {
			getCircle: function() {
				var center = circle.getLatLng();

				return {
					center: {lat: center.lat, lon: center.lng},
					radius: circle.getRadius()
				};
			},
			finish: function() {
				circle.remove();
				centerMarker.remove();
				radiusMarker.remove();
			}
		};
	};

	this.addTrack = function(positions) {
		var trackPolyline = L.polyline(positions);
		trackPolyline.addTo(map);
	};

	this.addCircle = function(options) {
		var center = options.circle,
		    radius = options.radius;

		var circle = new L.Circle(center, { radius: radius });

		circle.addTo(map);

		return {
			remove: function() {
				circle.remove();
			}
		};
	};

	this.toggleZoomControl = function(toggle) {
		if (toggle) map.addControl(zoomControl);
		else map.removeControl(zoomControl);
	};
}

if (typeof module !== 'undefined') module.exports = Map;
else (window.FrontSpot || (window.FrontSpot = {})).Map = Map;

})();