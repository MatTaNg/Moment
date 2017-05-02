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
			console.log("READ ZIP CODE FILE");
			var rawFile = new XMLHttpRequest();
			rawFile.open("GET", '../zipCodes.txt', false);
			rawFile.onreadystatechange = function ()
			{
				console.log("On ready state change");
				console.log(rawFile.readyState);
				if(rawFile.readyState === 4)
				{
					console.log(rawFile.status);
					if(rawFile.status === 200 || rawFile.status == 0)
					{
						var allText = rawFile.responseText;
						console.log(allText);
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
			console.log("INIT USER LOCATION");
			var deferred = $q.defer();
			var town = "";

			getCurrentLatLong().then(function(response) {
				console.log(JSON.stringify(response));
				var lat = response.lat;
				var lng = response.lng;
				getLocationFromCoords(lat, lng).then(function(response) {
					console.log(JSON.stringify(response));
					console.log("vm.customLocation");
					console.log(vm.customLocation);
					if(vm.customLocation.town) { //If the user has entered his own location use that instead
						console.log("TEST");
						town = vm.customLocation.town;
						lat = vm.customLocation.lat;
						lng = vm.customLocation.lng;
					} else {
						town = response.town;
					}
					console.log(town);
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
					console.log(result);
					deferred.resolve(result);
				});
			}, function(error) {
				deferred.reject(error);
			})

 return deferred.promise;
};

function getMomentsByState(states) {
	var deferred = $q.defer();
	var result = [];
	return Promise.all(states.map(state =>
		awsServices.getMoments(constants.MOMENT_PREFIX + state)
		));
};

function getMomentsWithinRadius(momentsInStates) {
	console.log("moment_radius_in_miles");
	console.log(moment_radius_in_miles);
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

function getLocationFromTown(town) {
	if(town.indexOf(',') !== -1) {
		var temp = town.split(',');
		temp[1] = temp[1].toUpperCase();
		town = temp[0] + ',' + temp[1];
	}
	town = town.charAt(0).toUpperCase() + town.slice(1);
	var deferred = $q.defer();

	$http.get(constants.GEOLOCATION_URL + "address=" + town).then(function(response) {
		response = response.data.results;
		console.log(response);
		console.log(response[0].formatted_address);
		console.log(town.toString());
		//We only want one response and the address should at least begin with the town name and should not be a road
		if(response.length === 1 && response[0].formatted_address.startsWith(town.toString()) && response[0].formatted_address.indexOf("Rd") === -1) { 
			var lat = response[0].geometry.location.lat;
			var lng = response[0].geometry.location.lng;
			console.log("QWEWQEWQ");
			console.log(response)
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

function getCoordsFromZipCode(zipCode) {
	console.log("GET COORDS FROM ZIP");
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
	console.log("ADDRESS");
	console.log(address);
	address = address.toString();
	address = address.slice(0, address.lastIndexOf(','));
	console.log(address);
	address = address.replace(/[0-9]/g, '');
	console.log(address.replace(/[0-9]/g, ''));
	return address
};

function getLocationFromCoords(latitude, longitude) {
	console.log("LAT");
	console.log(latitude);
	console.log(constants.GEOLOCATION_URL + "latlng=" + latitude + "," + longitude);
	var deferred = $q.defer();
	var latLng = ({lat: latitude, lng: longitude});
	$http.get(constants.GEOLOCATION_URL + "latlng=" + latitude + "," + longitude).then(function(response) {
		console.log(response);
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
 return deferred.promise;
};
}
})();