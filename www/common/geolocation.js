 (function() {
 	angular.module('geolocation', [])

 	.service('geolocation', ['geolocationService', 'logger', '$q', 'constants', '$cordovaGeolocation', 'permissions', 'core', geolocation]);

 	function geolocation(geolocationService, logger, $q, constants, $cordovaGeolocation, permissions, core){
 		var vm = this;
 		vm.getMomentsAroundUser = getMomentsAroundUser;

 		vm.initializeUserLocation = initializeUserLocation;
 		vm.setMomentInRadius = setMomentInRadius;
		vm.setLocation = setLocation;
		vm.isMomentWithRadius = isMomentWithRadius;

 		vm.userLocation = undefined;
 		vm.currentLocation = "Could not find location";
 		vm.locationNotFound = false;
 		vm.didUserChangeRadius = false;

		function isMomentWithRadius(key) {
			var coordinates = geolocationService.extractCoordinatesFromKey(key);
			var lat = coordinates.latitude;
			var lng = coordinates.longitude;
			if((lat < geolocation.max_north.lat && lat > geolocation.max_south.lat) &&
				(lng > geolocation.max_west.lng && lng < geolocation.max_east.lng )) {
				return true;
			}
			else {
				return false;
			}
		};

		function getMomentsAroundUser(startAfterKey) {
			var concatMoments = function(moments) {
				for(var i = 0; i < moments.length; i++) {
					// Take out any empty arrays
					if(moments[i].length === 0) {
						moments.splice(i, 1);
					} else {
						i++;
					}
				}
				var deferred = $q.defer();
				if(moments.length !== 0 ){
					deferred.resolve(moments[0]); //Object returns as [[{}]], fixing this.
				} else {
					deferred.resolve(moments);
				}
				return deferred.promise;
			};
			if(!vm.customLocation) {
				return setLocation()
				.then(geolocationService.calculateNearbyStates)
				.then(geolocationService.getMomentsByState.bind(null, startAfterKey))
				// .then(concatMoments)
				.then(geolocationService.getMomentsWithinRadius)
			}
			else {
				return geolocationService.calculateNearbyStates()
					.then(geolocationService.getMomentsByState.bind(null, startAfterKey))
					// .then(concatMoments)
					.then(geolocationService.getMomentsWithinRadius)		
			}
		};

		function setLocation(location) {
			var deferred = $q.defer();
			if(!constants.DEV_MODE) {
				if(!location) {
					vm.initializeUserLocation().then(function(location) {
						vm.currentLocation = location;
						vm.locationNotFound = false;
						deferred.resolve(vm.currentLocation);
					}, function(error) {
						vm.currentLocation.town = "Could not find location";
						vm.locationNotFound = true;
						var parameters = { location: location }
						logger.logOutMessage("geolocation.getLocation", parameters, error);
						deferred.reject();
					});
				}
				else if(location.lat && location.lng) {
					return geolocationService.getLocationFromCoords(location.lat, location.lng);
				}
				else if(!(/^\d+$/.test(location))) { //Does not contain digits
					geolocationService.getCoordinatesFromTown(location).then(function(location) {
						vm.currentLocation = location;
						vm.didUserChangeRadius = true;
						vm.customLocation = location;
						geolocationService.setMaxNESW(location.lat, location.lng);
						deferred.resolve(location);
					}, function(error) {
						vm.currentLocation.town = "Could not find location";
						var parameters = { location: location }
						logger.logOutMessage("geolocation.getLocation", parameters, error);
						deferred.reject(constants.LOCATION_NOT_FOUND_TXT);
					});
				}
				else { //It is a zip code
					geolocationService.getCoordsFromZipCode(location).then(function(location) {
						vm.currentLocation = location;
						vm.didUserChangeRadius = true;
						vm.customLocation = location;
						geolocationService.setMaxNESW(location.lat, location.lng);
						deferred.resolve(location);
					}, function(error) {
						vm.currentLocation.town = "Could not find location";
						var parameters = { location: location }
						logger.logOutMessage("geolocation.getLocation", parameters, error);
						deferred.reject(constants.LOCATION_NOT_FOUND_TXT);

					});
				}
			}
			else {
				vm.currentLocation = constants.MOCKED_COORDS;
				geolocationService.setMaxNESW(vm.currentLocation.lat, vm.currentLocation.lng);
				deferred.resolve( constants.MOCKED_COORDS );
			}
			return deferred.promise;
		};

		function setMomentInRadius(radius) {
			moment_radius_in_miles = radius;
			geolocationService.setLatMileRadius(0.016880283 * moment_radius_in_miles);
			geolocationService.setLngMileRadius(0.019158007 * moment_radius_in_miles);
		};

		function getCurrentLatLong() {
			var deferred = $q.defer();
			var posOptions = {timeout: 10000, enableHighAccuracy: true, maximumAge: 60000};
			if(constants.DEV_MODE === false) {
				$cordovaGeolocation.getCurrentPosition(posOptions)
				.then(function(position) {
					var lat = position.coords.latitude;
					var lng = position.coords.longitude;
					deferred.resolve({lat: lat, lng: lng});
				}, function(error) {
					logger.logOutMessage("geolocation.getCurrentLatLong", {}, error);
					deferred.reject(error);	
				});
			} else {
				deferred.resolve( constants.MOCKED_COORDS ) //Narberth, PA
			}
			return deferred.promise;
		};

		function initializeUserLocation(mockTown) {
			var deferred = $q.defer();
			var town = "";
			permissions.checkPermission("location").then(function() {
				if(!mockTown) {
					getCurrentLatLong().then(function(response) {
						var lat = response.lat;
						var lng = response.lng;
						geolocationService.setMaxNESW(lat, lng);
						geolocationService.getLocationFromCoords(lat, lng).then(function(response) {
							town = response.town;
							town = town.trim();
							vm.userLocation = {lat: lat, lng: lng, town: town, state: response.state};
							deferred.resolve(vm.userLocation);
						}, function(error) {
							var parameters = { mockTown: mockTown }
							logger.logOutMessage("geolocation.initializeUserLocation", parameters, error);
							deferred.reject(error.message);
						});
					}, function(error) {
						// if(error.message === "application does not have sufficient geolocation permissions.") {
						// initializeUserLocation();
							// }
						// else {
						// 	console.log(error);
						// 	deferred.reject(error);	
						// }
					});
				}
				else {
					deferred.resolve(mockTown);
				}
			}, function(error) {
				console.log("ERROR");
				console.log(error);
				var parameters = { mockTown: mockTown }
				logger.logOutMessage("geolocation.initializeUserLocation", parameters, error);
				deferred.reject(error);
			});
			return deferred.promise;
		};


}
})();