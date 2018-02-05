 (function() {
 	angular.module('geolocationService', [])

 	.service('geolocationService', ['common', 'logger', '$q', 'constants', '$http', 'awsServices', geolocationService]);

 	function geolocationService(common, logger, $q, constants, $http, awsServices){
 		var vm = this;

 		vm.getMomentsByState = getMomentsByState;
 		vm.getMomentsWithinRadius = getMomentsWithinRadius;
 		vm.calculateNearbyStates = calculateNearbyStates;

 		vm.getCoordinatesFromTown = getCoordinatesFromTown;
 		vm.getCoordsFromZipCode = getCoordsFromZipCode;
 		vm.getLocationFromCoords = getLocationFromCoords;

 		vm.extractCoordinatesFromKey = extractCoordinatesFromKey;
		vm.getLatMileRadius = getLatMileRadius;
		vm.getLngMileRadius = getLngMileRadius;
		vm.setLatMileRadius = setLatMileRadius;
		vm.setLngMileRadius = setLngMileRadius;

		vm.getStates = getStates; //calculatenearbystates
		vm.setMaxNESW = setMaxNESW;

 		vm.max_east = {};
 		vm.max_north = {};
 		vm.max_west = {};
 		vm.max_south = {};

 		var moment_radius_in_miles = localStorage.getItem('momentRadiusInMiles') | 25;

		var lat_mile_radius = 0.016880283 * moment_radius_in_miles; //1 mile distance between two points * perferred radius
		var lng_mile_radius = 0.019158007 * moment_radius_in_miles; //1 mile distance between two points * perferred radius
		
		function getLatMileRadius() {
			return lat_mile_radius;
		};

		function getLngMileRadius() {
			return lng_mile_radius;
		};

		function setLatMileRadius(lat) {
			lat_mile_radius = lat;
		};

		function setLngMileRadius(lng) {
			lng_mile_radius = lng;
		};

		function extractCoordinatesFromKey(key) {
			var lat = 0;
			var lng = 0;
			var coordinates = key.split('/')[key.split('/').length - 1];
			coordinates = coordinates.split('_');
			lat = coordinates[0].trim();
			lng = coordinates[1].trim();
			var result = {latitude: lat, longitude: lng};
			return result;
		};

		function getLocationFromCoords(latitude, longitude) {
			var deferred = $q.defer();
			var latLng = ({lat: latitude, lng: longitude});
			if(!constants.DEV_MODE) {
				$http.get(constants.GEOLOCATION_URL + "latlng=" + latitude + "," + longitude).then(function(response) {
					response = response.data.results;
					if(response.length < 3) {
						deferred.resolve({lat: latitude, lng: longitude, town: "", state: ""});
					} else {
						var town = extractAddressFrom_FormattedAddress(response[2].formatted_address);
						town = town.trim();
						var state = findStateFromResponse(response);
						deferred.resolve({lat: latitude, lng: longitude, town: town, state: state});
					}
				}, function(error) {
					var parameters = {
						Lat: latitude,
						Lng: longitude
					};
					logger.logOutMessage("geolocation.getLocationFromCoords", parameters, error);
					deferred.reject(error);
				});
			} else {
				deferred.resolve( constants.MOCKED_COORDS );
			}
			return deferred.promise;
		};

		//Untested
		function getCoordsFromZipCode(zipCode) {
			var coordsFound = false;
			var deferred = $q.defer();
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "zipCodes.txt", true);
			xhr.responseType = "text";
			xhr.onreadystatechange = function() {
				if(xhr.readyState === 4) {
					if(xhr.status === 200 || xhr.status === 0) {
						var geocoder = new google.maps.Geocoder();
						var fr = new FileReader();
						fr.onload = function(event) {
							var contents = event.target.result;
							fileContents = contents.split("\n");
							for(var i = 0; i < fileContents.length; i++) {
								if(fileContents[i].indexOf(zipCode.toString()) !== -1) {
									fileContents[i] = fileContents[i].split(',');
									if(fileContents[i][0].trim() === zipCode.toString()) {
										coordsFound = true;
										var lat = fileContents[i][1].trim();
										var lng = fileContents[i][2].trim();
										vm.getLocationFromCoords(lat, lng).then(function(location) {
											deferred.resolve({lat: location.lat, lng: location.lng, town: location.town, state: location.state});	
										});
									}
								}
								if(i === fileContents.length - 1 && coordsFound === false) {
									deferred.reject("Zip code not found");
								}
							}
						};
						var myblob = new Blob([xhr.responseText], {
							type: 'text/plain'
						});

						var fileContents = fr.readAsText(myblob);
					} else {
						var parameters = {
							zipCode: zipCode
						}
						logger.logFile("geolocation.getCoordsFromZipCode", parameters, '', 'errors.txt');
						deferred.reject();
					}
				}
			}
			xhr.send(null);
		return deferred.promise;
		};
		
		function makeSureTownIsRightFormat(town) {
			town = town.trim();
			if(town.indexOf(',') !== -1) { //Check for a comma
				var temp = town.split(',');

			} else if(town.indexOf(' ') !== -1){ //Check for space
				var temp = town.split(' ');	     //narberth|pa
			} else {
				return "undefined"; //Town is not in correct format
			}
			temp[0] = temp[0].trim();
			temp[1] = temp[1].trim();
			temp[1] = temp[1].toUpperCase();
			town = temp[0] + ', ' + temp[1];
			return town.charAt(0).toUpperCase() + town.slice(1); //Narberth,PA
		};

		//The right format is [townName, StateName] Ex: Narberth, PA (Case sensitive, exact match)
		//Acceptable formats: narberth, pa | narberth pa | Narberth,Pa | etc...
		function getCoordinatesFromTown(town) {
			var deferred = $q.defer();
			town = makeSureTownIsRightFormat(town);
			if(town === "undefined") {
				deferred.reject();
			}
			$http.get(constants.GEOLOCATION_URL + "address=" + town).then(function(response) {
				response = response.data.results;
				//We only want one response and the address should at least begin with the town name and should not be a road
				if(response.length === 1 && response[0].formatted_address.indexOf("Rd") === -1) { 
					var lat = response[0].geometry.location.lat;
					var lng = response[0].geometry.location.lng;
					town = extractAddressFrom_FormattedAddress(response[0].formatted_address);
					var state = findStateFromResponse(response);
					var coordinates = {lat: lat, lng:lng, town: town, state: state};
					deferred.resolve(coordinates);
				}
				var parameters = { town: town }
				logger.logOutMessage("geolocation.getCoordinatesFromTown", parameters, '');
				deferred.reject();
			}, function(error) {
				var parameters = {
					town : town			
				};
				logger.logOutMessage("geolocation.getLocationFromTown", parameters, error);
				deferred.reject(error);
			});
			return deferred.promise;
		};

		function calculateNearbyStates() {
			var deferred = $q.defer();
			var nearbyState = {north: "", south: "", west: "", east: ""};
			var result = [];
			vm.getStates().then(function(nearbyStates) {
				result.push(nearbyStates.north);
				if(result.indexOf(nearbyStates.south) === -1) {
					result.push(nearbyStates.south);
				}
				if(result.indexOf(nearbyStates.west) === -1) {
					result.push(nearbyStates.west);
				}
				if(result.indexOf(nearbyStates.east) === -1) {
					result.push(nearbyStates.east);
				}
				deferred.resolve(result);
			}, function(error) {
				logger.logOutMessage("geolocation.calculatenearbystates", '', error);
				deferred.reject(error);
			});

	 return deferred.promise;
	};

		function getMomentsWithinRadius(momentsInStates) {
			var deferred = $q.defer();
			var promises = [];
			var result = [];
			async.each(momentsInStates, function(moment, callback) {
				var key = moment.key;
				var temp = moment.key.split('/');
				temp = temp[temp.length - 1].split('_');
				var momentsInStates_lat = temp[0];
				var momentsInStates_lng = temp[1];
				if(momentsInStates_lat < vm.max_north.lat && momentsInStates_lat > vm.max_south.lat &&
					momentsInStates_lng > vm.max_west.lng && momentsInStates_lng < vm.max_east.lng) {
					promises.push(awsServices.getMomentMetaData(moment.key).then(function(metaData) {
						result = result.concat(common.populateMomentObj(metaData));
						callback();
					}))
				}
				else {
					callback();
				}
			}, function (error) {
				if(error) {
					deferred.reject();
				}
				deferred.resolve(result);
			});
 			return deferred.promise;
		};

		function getMomentsByState(startAfter, states) {
			var deferred = $q.defer();
			if(!startAfter) { startAfter = '' }
			var result = [];
			async.each(states, function(state, callback) {

				awsServices.getMoments(constants.MOMENT_PREFIX + state, startAfter, constants.MAX_MOMENTS_PER_GET).then(function(moments) {
					if(moments.length > 0) {
						if(startAfter !== '') {
							moments = moments[0].splice(0, 1);
						}
						result = result.concat(moments);
					}
					callback();
				});
			}, function(error) {
				if(error) {
					deferred.reject(error);
				}
				deferred.resolve(result);
			});
			return deferred.promise;
		};

		function getStates() {
			var deferred = $q.defer();
			var nearbyStates = {};
			vm.getLocationFromCoords(vm.max_north.lat, vm.max_north.lng).then(function(location) {
				nearbyStates.north = location.state;
				vm.getLocationFromCoords(vm.max_south.lat, vm.max_south.lng).then(function(location) {
					nearbyStates.south = location.state;
					vm.getLocationFromCoords(vm.max_west.lat, vm.max_west.lng).then(function(location) {
						nearbyStates.west = location.state;
						vm.getLocationFromCoords(vm.max_east.lat, vm.max_east.lng).then(function(location) {
							nearbyStates.east = location.state;
							deferred.resolve(nearbyStates);
						});
					});
				});
			}, function(error) {
				logger.logOutMessage("geolocation.getStates", "", error);
				deferred.reject(error);
			});
			return deferred.promise;
		};

		function setMaxNESW (lat, lng) {
			vm.max_north = { lat: parseFloat(lat) + getLatMileRadius(), lng: lng }; 
			vm.max_south = { lat: parseFloat(lat) - getLatMileRadius(), lng: lng }; 
			vm.max_west = {  lat: lat, lng: parseFloat(lng) - getLngMileRadius() };
			vm.max_east = {  lat: lat, lng: parseFloat(lng) + getLngMileRadius() };
			if(constants.DEV_MODE) {
				vm.max_north = { lat: 99999, lng: 99999 };
				vm.max_south = { lat: -99999, lng: 99999 };
				vm.max_west = { lat: 99999, lng: -99999 };
				vm.max_east = { lat: 99999, lng: 99999 };
			}
		};

		function extractAddressFrom_FormattedAddress(address) {
			address = address.toString();
			address = address.slice(0, address.lastIndexOf(','));
			address = address.replace(/[0-9]/g, '');
			return address
		};

		function findStateFromResponse(response) {
			for(var i = 0; i < response.length; i++) {
				for(var x = 0; x < response[i].address_components.length; x++) {
					if(response[i].address_components[x].short_name.length === 2 && /^[a-z]+$/i.test(response[i].address_components[x].short_name)) {
						return response[i].address_components[x].short_name;
					}
				}
			}
			return extractAddressFrom_FormattedAddress(response[2].formatted_address).split(',')[1].trim();
		};

}
})();