 (function() {
 	angular.module('geolocation', [])

 	.service('geolocation', ['logger', '$q', '$cordovaGeolocation', geolocation]);

 	function geolocation(logger, $q, $cordovaGeolocation){
 		this.calculateNearbyStates = calculateNearbyStates;
 		this.getStates = getStates;
 		this.getMomentsByState = getMomentsByState;
 		this.getMomentsWithinRadius = getMomentsWithinRadius;
 		this.getDeviceLocation = getDeviceLocation;
 		this.initializeUserLocation = initializeUserLocation;
 		this.getLatMileRadius = getLatMileRadius;
 		this.getLngMileRadius = getLngMileRadius;
 		this.getCurrentLatLong = getCurrentLatLong;

 		var moment_radius_in_miles = localStorage.getItem('momentRadiusInMiles');
		var lat_mile_radius = 0.016880283 * moment_radius_in_miles; //1 mile distance between two points * perferred radius
		var lng_mile_radius = 0.019158007 * moment_radius_in_miles; //1 mile distance between two points * perferred radius

		function getLatMileRadius() {
			return lat_mile_radius;
		};

		function getLngMileRadius() {
			return lng_mile_radius;
		};

		function getCurrentLatLong() {
			var deferred = $q.defer();
			var posOptions = {timeout: 10000, enableHighAccuracy: false};
			$cordovaGeolocation.getCurrentPosition(posOptions)
			.then(function(position) {
				var lat = position.coords.latitude;
				var lng = position.coords.longitude;
				deferred.resolve({lat: lat, lng: lng});
			}, function(error) {
				logger.logFile("core.getCurrentLatLong", {}, error, 'logs.txt').then(function() {
					deferred.reject(error);	
				});
			});
			return deferred.promise;
		};

		function getStates(north, south, west, east) {
			var deferred = $q.defer();
			var nearbyStates = {};
			getDeviceLocation(this.max_north.lat, this.max_north.lng).then(function(location) {
				nearbyStates.north = location.split(',')[1].trim();
				getDeviceLocation(max_south.lat, max_south.lng).then(function(location) {
					nearbyStates.south = location.split(',')[1].trim();
					getDeviceLocation(max_west.lat, max_west.lng).then(function(location) {
						nearbyStates.west = location.split(',')[1].trim();
						getDeviceLocation(max_east.lat, max_east.lng).then(function(location) {
							nearbyStates.east = location.split(',')[1].trim();
							deferred.resolve(nearbyStates);
						});
					});
				});
			}, function(error) {
				deferred.reject(error);
			});
			return deferred.promise;
		};

		function initializeUserLocation() {
			var deferred = $q.defer();

			getCurrentLatLong().then(function(response) {
				var lat = response.lat;
				var lng = response.lng;
				geolocation.getDeviceLocation(lat, lng).then(function(response) {
					var town = response.split(',')[0].trim();
					var state = response.split(',')[1].trim();
					vm.userLocation = {lat: lat, lng: lng, town: town, state: state}; 
					deferred.resolve(vm.userLocation);
				}, function(error) {
					deferred.reject(error.message);
				});
			}, function(error) {
				deferred.reject(error);	
			});
			return deferred.promise;
		};

		function calculateNearbyStates() {
			var deferred = $q.defer();

			initializeUserLocation().then(function(locationData) {
				this.max_north = { lat: locationData.lat + getLatMileRadius(), lng: locationData.lng }; 
				this.max_south = { lat: locationData.lat - getLatMileRadius(), lng: locationData.lng }; 
				this.max_west = {  lat: locationData.lat, lng: locationData.lng - getLngMileRadius() };
				this.max_east = {  lat: locationData.lat, lng: locationData.lng + getLngMileRadius() };

				var nearbyState = {north: "", south: "", west: "", east: ""};
				var result = [];
				getStates(this.max_north, this.max_south, this.max_west, this.max_east).then(function(nearbyStates) {

					result.push(nearbyStates.north);
					if(result.indexOf(nearbyStates.south) === -1) {
						result.push(nearbyStates.south);
					}
					if(!result.indexOf(nearbyStates.west) === -1) {
						result.push(nearbyStates.west);
					}
					if(!result.indexOf(nearbyStates.east) === -1) {
						result.push(nearbyStates.east);
					}
					deferred.resolve(result);
				});
			})

			return deferred.promise;
		};

		function getMomentsByState(states) {
			var deferred = $q.defer();
			var result = [];
			return Promise.all(states.map(state =>
				awsServices.getMoments(constants.MOMENT_PREFIX + state)
				));

			return deferred.promise;
		};

		function getMomentsWithinRadius(momentsInStates) {
			return Promise.all(momentsInStates.map(moment =>
				awsServices.getMomentMetaData(moment.Key).then(metaData => ({
					key: constants.IMAGE_URL + moment.Key, 
					description: metaData.description,
					likes: metaData.likes,
					location: metaData.location,
					time: metaData.time,
					uuids: metaData.uuids,
					views: metaData.views
				}))
				));
		};

		function getDeviceLocation(lat, lng) {
			var deferred = $q.defer();
			var url = constants.GEOLOCATION_URL + lat + ',' + lng;

			$http.get(url).then(function(response) {
				response = response.data.results[2].formatted_address;
				response = response.slice(0, response.lastIndexOf(','));
				response = response.replace(/[0-9]/g, '');
				deferred.resolve(response);
			}, function(error) {
				var parameters = {
					Lat: lat,
					Lng: lng
				};
				logger.logFile("geolocation.getDeviceLocation", parameters, error, 'logs.txt').then(function() {
					deferred.reject(error);	
				});
				deferred.reject(error);
			});
			return deferred.promise;
		};
	}
})();