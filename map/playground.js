(function(){

window.addEventListener('load', onLoad);

function onLoad() {
	var mapContainerEl = document.querySelector('.map-container');

	var map = new FrontSpot.Map();
	mapContainerEl.appendChild(map.getElement());
	map.onShown();

	map.setCenter({ lat: 53.9, lon: 27.5 });

	var circleDrawing = null;

	document.querySelector('.add-circle-button').addEventListener('click', function() {
		if (circleDrawing) return;

		circleDrawing = map.startCircleDrawing({ center: map.getCenter(), radius: 500});
	});

	document.querySelector('.save-circle-button').addEventListener('click', function() {
		if (!circleDrawing) return;

		console.log('your circle:', circleDrawing.getCircle());

		circleDrawing.finish();
	});

	window.addEventListener('resize', function() {
		map.onResize();
	});
}

function MapUnit() {
	this.watchPosition = function(fun) {
		fun(this.getPosition());
	};

	this.getPosition = function() {
		return { lat: 53.9, lon: 27.5 };
	};

	this.watchIcon = function(){};
}

})();