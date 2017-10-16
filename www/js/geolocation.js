 (function() {
 	angular.module('geolocation', [])

 	.service('geolocation', ['logger', '$q', 'constants', '$http', '$cordovaGeolocation', 'awsServices', 'permissions', geolocation]);

 	function geolocation(logger, $q, constants, $http, $cordovaGeolocation, awsServices, permissions){
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
 		vm.getCoordinatesFromTown = getCoordinatesFromTown;
 		vm.getCoordsFromZipCode = getCoordsFromZipCode;
 		vm.setMomentInRadius = setMomentInRadius;
 		vm.setMaxNESW = setMaxNESW;

 		vm.max_east = {};
 		vm.max_north = {};
 		vm.max_west = {};
 		vm.max_south = {};
 		vm.userLocation = undefined;

 		var moment_radius_in_miles = localStorage.getItem('momentRadiusInMiles');
 		if(moment_radius_in_miles === null) {
 			moment_radius_in_miles = 25;
 		}
		var lat_mile_radius = 0.016880283 * moment_radius_in_miles; //1 mile distance between two points * perferred radius
		var lng_mile_radius = 0.019158007 * moment_radius_in_miles; //1 mile distance between two points * perferred radius
		function getLatMileRadius() {
			return lat_mile_radius;
		};

		function getLngMileRadius() {
			return lng_mile_radius;
		};

		function setMomentInRadius(radius) { //Do I use this?
			moment_radius_in_miles = radius;
			lat_mile_radius = 0.016880283 * moment_radius_in_miles;
			lng_mile_radius = 0.019158007 * moment_radius_in_miles;
		};

		function readZipCodeFile() { //Untested
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
			console.log("==========GET CURRENT LAT LONG");
			var deferred = $q.defer();
			var posOptions = {timeout: 10000, enableHighAccuracy: true, maximumAge: 60000};
			if(constants.DEV_MODE === false) {
				$cordovaGeolocation.getCurrentPosition(posOptions)
				.then(function(position) {
					var lat = position.coords.latitude;
					var lng = position.coords.longitude;
					deferred.resolve({lat: lat, lng: lng});
				}, function(error) {
					// logger.logOutMessage("geolocation.getCurrentLatLong", {}, error);
					deferred.reject(error);	
				});
			} else {
				deferred.resolve( constants.MOCKED_COORDS ) //Narberth, PA
			}
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
				deferred.reject(error);
			});
			return deferred.promise;
		};

		function initializeUserLocation(mockTown) {
			console.log("==========INITIALIZE USER LOCATION");
			var deferred = $q.defer();
			var town = "";
			permissions.checkPermission("location").then(function() {

				if(!mockTown) {
					vm.getCurrentLatLong().then(function(response) {
						var lat = response.lat;
						var lng = response.lng;
						setMaxNESW(lat, lng);
						vm.getLocationFromCoords(lat, lng).then(function(response) {
							town = response.town;
							town = town.trim();
							vm.userLocation = {lat: lat, lng: lng, town: town};
							deferred.resolve(vm.userLocation);
						}, function(error) {
							deferred.reject(error.message);
						});
					}, function(error) {
						// if(error.message === "application does not have sufficient geolocation permissions.") {
						console.log("INITIALIZE USER LOCATION ERROR");
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
				deferred.reject(error);
			});
			return deferred.promise;
		};

		function calculateNearbyStates() {
			console.log("==========calculateNearbyStates");
			var deferred = $q.defer();
			var nearbyState = {north: "", south: "", west: "", east: ""};
			var result = [];
			vm.getStates().then(function(nearbyStates) {
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
			}, function(error) {
				deferred.reject(error);
			});

	 return deferred.promise;
	};

function getMomentsByState(startAfter, states) {
	console.log("==========GET MOMENTS BY STATE");
	console.log(startAfter);
	var result = [];
	var promises = [];
	for(var i = 0; i < states.length; i++){
		if(startAfter !== '') { 
			promises.push(awsServices.getMoments(constants.MOMENT_PREFIX + states[i], startAfter).then(function(moments) {
				//getMoments returns the the startAfter moment for some reason.  Remove it
				var startAfterKey = startAfter.split("/");
				startAfterKey = startAfterKey[startAfterKey.length - 1];
				for(var i = 0; i < moments.length; i) {
					if(moments[i].Key.includes(startAfterKey) || moments[i].Key.split("/").length < 4) {
						moments.splice(i, 1);
					} else {
						i++;
					}
				}
				return $q.resolve(moments);
			}));
		}
		else {
			promises.push(awsServices.getMoments(constants.MOMENT_PREFIX + states[i], ''));
		}
	}
	return $q.all(promises);
};

function getMomentsWithinRadius(momentsInStates) {
	console.log("==========GET MOMENTS WITHIN RADIUS");
	var promises = [];
	for(var i = 0; i < momentsInStates.length; i++) {
		var key = momentsInStates[i].Key;
		var temp = momentsInStates[i].Key.split('/');
		temp = temp[temp.length - 1].split('_');
		var momentsInStates_lat = temp[0];
		var momentsInStates_lng = temp[1];
		if(momentsInStates_lat < vm.max_north.lat && momentsInStates_lat > vm.max_south.lat &&
			momentsInStates_lng > vm.max_west.lng && momentsInStates_lng < vm.max_east.lng) {
			promises.push(awsServices.getMomentMetaData(momentsInStates[i].Key).then(function(metaData) {
				return {
					key: metaData.key,
					description: metaData.description,
					likes: metaData.likes,
					location: metaData.location,
					time: metaData.time,
					uuids: metaData.uuids,
					views: metaData.views,
					media: metaData.media
				};
			}))
		}
	}
	return $q.all(promises);
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
			var coordinates = {lat: lat, lng:lng, town: town};
			deferred.resolve(coordinates);
		}
		deferred.reject();
	}, function(error) {
		var parameters = {
			Lat: lat,
			Lng: lng
		};
		logger.logOutMessage("geolocation.getLocationFromTown", parameters, error);
		deferred.reject(error);
	});
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
								getLocationFromCoords(lat, lng).then(function(location) {
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
				console.log("ERROR in Geolocation getCoordsFromZipCode");
				console.log("Zip Code: ", zipCode);
				deferred.reject();
			}
		}
	}
	xhr.send(null);
// var zipCodes = readZipCodeFile();
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

function extractAddressFrom_FormattedAddress(address) {
	address = address.toString();
	address = address.slice(0, address.lastIndexOf(','));
	address = address.replace(/[0-9]/g, '');
	return address
};

function getLocationFromCoords(latitude, longitude) {
	console.log("=========GET LOCATION FROM COORDS");
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
				if(town.indexOf(',') !== -1) {
					var state = town.split(',')[1].trim();
				} else {
					var state = town
				}
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

}
})();