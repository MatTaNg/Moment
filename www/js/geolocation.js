 (function() {
 	angular.module('geolocation', [])

 	.service('geolocation', ['logger', '$q', 'constants', '$http', '$cordovaGeolocation', 'awsServices', geolocation]);

 	function geolocation(logger, $q, constants, $http, $cordovaGeolocation, awsServices){
 		var vm = this;
 		vm.calculateNearbyStates = calculateNearbyStates;
 		vm.getStates = getStates;
 		vm.getMomentsByState = getMomentsByState;
 		vm.getMomentsWithinRadius = getMomentsWithinRadius;
 		vm.getLocationFromCoords = getLocationFromCoords;
 		vm.initializeUserLocation = initializeUserLocation;
 		vm.getLatMileRadius = getLatMileRadius;
 		vm.getLngMileRadius = getLngMileRadius;
 		vm.getCurrentLatLong = getCurrentLatLong;
 		vm.readZipCodeFile = readZipCodeFile;
 		vm.getLocationFromTown = getLocationFromTown;
 		vm.getCoordsFromZipCode = getCoordsFromZipCode;
 		vm.setMomentInRadius = setMomentInRadius;

 		vm.customLocation = {};
 		vm.max_east = {};
 		vm.max_north = {};
 		vm.max_west = {};
 		vm.max_south = {};
 		vm.userLocation = undefined;

 		var moment_radius_in_miles = localStorage.getItem('momentRadiusInMiles');
		var lat_mile_radius = 0.016880283 * moment_radius_in_miles; //1 mile distance between two points * perferred radius
		var lng_mile_radius = 0.019158007 * moment_radius_in_miles; //1 mile distance between two points * perferred radius

		function getLatMileRadius() {
			return lat_mile_radius;
		};

		function getLngMileRadius() {
			return lng_mile_radius;
		};

		function setMomentInRadius(radius) {
			moment_radius_in_miles = radius;
			lat_mile_radius = 0.016880283 * moment_radius_in_miles;
			lng_mile_radius = 0.019158007 * moment_radius_in_miles;
		};

		function readZipCodeFile() {
			var rawFile = new XMLHttpRequest();
			rawFile.open("GET", '../zipCodes.txt', false);
			rawFile.onreadystatechange = function ()
			{
				if(rawFile.readyState === 4)
				{
					if(rawFile.status === 200 || rawFile.status == 0)
					{
						var allText = rawFile.responseText;
						return allText;
					}
				}
			}
			rawFile.send(null);
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
				logger.logFile("geolocation.getCurrentLatLong", {}, error, 'error.txt').then(function() {
					deferred.reject(error);	
				});
			});
			return deferred.promise;
		};

		function getStates(north, south, west, east) {
			var deferred = $q.defer();
			var nearbyStates = {};
			getLocationFromCoords(vm.max_north.lat, vm.max_north.lng).then(function(location) {
				nearbyStates.north = location.town.split(',')[1].trim();
				getLocationFromCoords(vm.max_south.lat, vm.max_south.lng).then(function(location) {
					nearbyStates.south = location.town.split(',')[1].trim();
					getLocationFromCoords(vm.max_west.lat, vm.max_west.lng).then(function(location) {
						nearbyStates.west = location.town.split(',')[1].trim();
						getLocationFromCoords(vm.max_east.lat, vm.max_east.lng).then(function(location) {
							nearbyStates.east = location.town.split(',')[1].trim();
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
			var town = "";

			getCurrentLatLong().then(function(response) {
				var lat = response.lat;
				var lng = response.lng;
				getLocationFromCoords(lat, lng).then(function(response) {
					if(vm.customLocation.town) { //If the user has entered his own location use that instead
						town = vm.customLocation.town;
						lat = vm.customLocation.lat;
						lng = vm.customLocation.lng;
					} else {
						town = response.town;
					}
					vm.userLocation = {lat: lat, lng: lng, town: town}; 
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
				vm.max_north = { lat: locationData.lat + getLatMileRadius(), lng: locationData.lng }; 
				vm.max_south = { lat: locationData.lat - getLatMileRadius(), lng: locationData.lng }; 
				vm.max_west = {  lat: locationData.lat, lng: locationData.lng - getLngMileRadius() };
				vm.max_east = {  lat: locationData.lat, lng: locationData.lng + getLngMileRadius() };

				var nearbyState = {north: "", south: "", west: "", east: ""};
				var result = [];
				getStates(vm.max_north, vm.max_south, vm.max_west, vm.max_east).then(function(nearbyStates) {
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
			}, function(error) {
				deferred.reject(error);
			})

 return deferred.promise;
};

function getMomentsByState(states) {
	var result = [];
	var promises = [];
	for(var i = 0; i < states.length; i++){
		promises.push(awsServices.getMoments(constants.MOMENT_PREFIX + states[i]));
	}
	return Promise.all(promises);
};

function getMomentsWithinRadius(momentsInStates) {
	var promises = [];
	for(var i = 0; i < momentsInStates.length; i++) {
		promises.push(awsServices.getMomentMetaData(momentsInStates[i]).then(function(metaData) {
			return {
				key: constants.IMAGE_URL + moment.Key, 
				description: metaData.description,
				likes: metaData.likes,
				location: metaData.location,
				time: metaData.time,
				uuids: metaData.uuids,
				views: metaData.views
			};
		}))
	}
	return Promise.all(promises);
};

function getLocationFromTown(town) {
	town = makeSureTownIsRightFormat(town);
	var deferred = $q.defer();

	$http.get(constants.GEOLOCATION_URL + "address=" + town).then(function(response) {
		response = response.data.results;
		//We only want one response and the address should at least begin with the town name and should not be a road
		if(response.length === 1 && response[0].formatted_address.startsWith(town.toString()) && response[0].formatted_address.indexOf("Rd") === -1) { 
			var lat = response[0].geometry.location.lat;
			var lng = response[0].geometry.location.lng;
			town = extractAddressFrom_FormattedAddress(response[0].formatted_address);
			var coordinates = {lat: lat, lng:lng, town: town};
			deferred.resolve(coordinates);
		}
		deferred.reject();
	}, function(error) {
		var parameters = {
			Lat: lat,
			Lng: lng
		};
		logger.logFile("geolocation.getLocationFromTown", parameters, error, 'error.txt').then(function() {
			deferred.reject(error);	
		});
		deferred.reject(error);
	});
	return deferred.promise;
};

function makeSureTownIsRightFormat(town) {
	if(town.indexOf(',') !== -1) {
		var temp = town.split(',');
		temp[1] = temp[1].toUpperCase();
		town = temp[0] + ',' + temp[1];
	}
	return town.charAt(0).toUpperCase() + town.slice(1);
};

function getCoordsFromZipCode(zipCode) {
// 	var deferred = $q.defer();
// 	var xhr = new XMLHttpRequest();
// 	xhr.open("GET", "zipCodes.txt", true);
// 	xhr.responseType = "text";
// 	xhr.onreadystatechange = function() {
// 		if(xhr.readyState === 4) {
// 			if(xhr.status === 200 || xhr.status === 0) {
// 				var geocoder = new google.maps.Geocoder();
// 				var fr = new FileReader();
// 				fr.onload = function(event) {
// 					var contents = event.target.result;
// 					fileContents = contents.split("\n");
// 					for(var i = 0; i < fileContents.length; i++) {
// 						if(fileContents[i].indexOf(zipCode.toString()) !== -1) {
// 							fileContents[i] = fileContents[i].split(',');
// 							if(fileContents[i][0].trim() === zipCode.toString()) {
// 								var lat = fileContents[i][1].trim();
// 								var lng = fileContents[i][2].trim();
// 								deferred.resolve({lat: lat, lng: lng});	
// 							}
// 						}
// 					}
// 				};
// 				var myblob = new Blob([xhr.responseText], {
// 					type: 'text/plain'
// 				});

// 				var fileContents = fr.readAsText(myblob);
// 			}
// 		}
// 	}
// 	xhr.send(null);
// // var zipCodes = readZipCodeFile();
// return deferred.promise;
};

function extractAddressFrom_FormattedAddress(address) {
	address = address.toString();
	address = address.slice(0, address.lastIndexOf(','));
	address = address.replace(/[0-9]/g, '');
	return address
};

function getLocationFromCoords(latitude, longitude) {
	var deferred = $q.defer();
	var latLng = ({lat: latitude, lng: longitude});
	$http.get(constants.GEOLOCATION_URL + "latlng=" + latitude + "," + longitude).then(function(response) {
		response = response.data.results
		var town = extractAddressFrom_FormattedAddress(response[1].formatted_address);
		deferred.resolve({lat: latitude, lng: longitude, town: town});
	}, function(error) {
		var parameters = {
			Lat: latitude,
			Lng: longitude
		};
		logger.logFile("geolocation.getLocationFromCoords", parameters, error, 'error.txt').then(function() {
			deferred.reject(error);	
		});
		deferred.reject(error);
	});
	return deferred.promise;
};

	// var geocoder = new google.maps.Geocoder();
	// geocoder.geocode({location: latLng }, function(response, status) {
	// 	console.log(status);
	// 	console.log(response);
	// 	response = response[1].formatted_address;
	// 	// response = extractAddressFrom_FormattedAddress(response);
	// 	deferred.resolve(response);
	// }, function(error) {
	// 	var parameters = {
	// 		Lat: lat,
	// 		Lng: lng
	// 	};
	// 	logger.logFile("geolocation.getAddressFromCoords", parameters, error, 'error.txt').then(function() {
	// 		deferred.reject(error);	
	// 	});
	// 	deferred.reject(error);
	// });
	// var deferred = $q.defer();
	// var url = constants.GEOLOCATION_URL + lat + ',' + lng;

	// $http.get(url).then(function(response) {
	// 	response = response.data.results[2].formatted_address;
	// 	response = response.slice(0, response.lastIndexOf(','));
	// 	response = response.replace(/[0-9]/g, '');
	// 	deferred.resolve(response);
	// }, function(error) {
	// 	var parameters = {
	// 		Lat: lat,
	// 		Lng: lng
	// 	};
	// 	logger.logFile("geolocation.getDeviceLocation", parameters, error, 'logs.txt').then(function() {
	// 		deferred.reject(error);	
	// 	});
	// 	deferred.reject(error);
	// });
}
})();