 (function() {
 	angular.module('core', [])

 	.service('core', ['$cordovaGeolocation', '$q', '$http', 'constants', 'awsServices', core]);

 	function core($cordovaGeolocation, $q, $http, constants, awsServices){
 		var vm = this,
 		deferred = $q.defer();

 		var moment_radius_in_miles = 25,
		lat_mile_radius = 0.016880283 * moment_radius_in_miles, //1 mile distance between two points * perferred radius
		lng_mile_radius = 0.019158007 * moment_radius_in_miles, //1 mile distance between two points * perferred radius

		verifyMetaData = verifyMetaData;
		vm.splitUrlOff = splitUrlOff;

		vm.userLocation = undefined;
		vm.moments = [];

		vm.initializeUserLocation = initializeUserLocation,
		vm.timeElapsed = timeElapsed,
		vm.getCurrentTime = getCurrentTime;
		vm.getCurrentLatLong = getCurrentLatLong;
		vm.getUUID = getUUID;
		vm.getLatMileRadius = getLatMileRadius;
		vm.getLngMileRadius = getLngMileRadius;
		vm.getDeviceLocation = getDeviceLocation;
		vm.getHardCodedMoments = getHardCodedMoments;

		vm.remove = remove;
		vm.edit = edit;
		vm.upload = upload;
		vm.logFile = logFile;

		function getLatMileRadius() {
			return lat_mile_radius;
		};

		function getLngMileRadius() {
			return lng_mile_radius;
		};

		function getMomentRadiusInMiles() {
			return moment_radius_in_miles
		};

		function setMomentRadiusInMiles(newRadius) {
			moment_radius_in_miles = newRadius;
		};

		function splitUrlOff(key) {
			var result = "";
			var keySplit = key.split('/');
			if(keySplit.length > 4) {
				for(var i = 4; i < keySplit.length; i++) {
					result = result + keySplit[i] + '/';
				}
				return result.substring(0, result.length-1);
			}
			else {
				return key;
			}
		};

		function remove(moment) {
			var deferred = $q.defer();
			var path = splitUrlOff(moment.key);
			awsServices.remove(path).then(function() {
				deferred.resolve();
			}, function(error) {
				error = "FAILURE - aws_services.remove" + "\r\n" + "PATH: " + path + "\r\n" + error;
				console.log("FAILURE IN aws_services.remove");
				console.log(error);
				logFile(error, 'errors.txt').then(function() {
					deferred.reject(error);	
				});
			});
			return deferred.promise;
		};

		var verifyMetaData = function(moment) {
			if(moment.key.includes('reports')) {
				return true;
			}
			if(	moment.location &&
				moment.likes &&
				moment.description !== undefined &&
				moment.time &&
				moment.views &&
				moment.uuids)
				return true;
			else {
				var error = "FAILURE - core.verifyMetaData" + "\r\n" + "MOMENT: " + moment + "\r\n" + error;
				console.log("FAILURE IN aws_services.getMoments");
				console.log(error);
				logFile(error, 'errors.txt').then(function() {
					return false;
				});
			}
		}

		function edit(moment){
			var deferred = $q.defer();
			var key = moment.key;
			if(verifyMetaData(moment)) {
				key = splitUrlOff(key);
				awsServices.copyObject(key, key, moment, "REPLACE").then(function() {
					deferred.resolve();
				}, function(error) {
					error = "FAILURE - aws_services.copyObject" + "\r\n" + "KEY: " + key + " | copySource: " + copySource + " | META DATA: " + metaData + " | DIRECTIVE: " + directive + "\r\n" + error;
					console.log("FAILURE IN aws_services.copyObject");
					console.log(error);
					logFile(error, 'errors.txt').then(function() {
						deferred.reject(error);	
					});
				});
			}
			else {
				deferred.reject();
			}
			return deferred.promise;
		};

		function logFile(message, key) {
			var deferred = $q.defer();
			var key = 'reports/' + key;
			console.log("KEY");
			console.log(key);
			console.log(moment);
			var moment = {key: key};
			var params = {
				Bucket: constants.BUCKET_NAME,
				Key: key
			};
			awsServices.getObject(key).then(function(data) {
				message = Date() + ': ' + message + "\r\n" + data;
				var blob = new Blob([message], {type: "text"});
				var file =  new File([blob], key);
				upload(file, moment).then(function() {
					deferred.resolve();
				}, function(error) {
					deferred.reject();
				});
			}, function(error) {
				console.log("ERROR");
				console.log(error);
				deferred.reject();
			});
			return deferred.promise;
		};

		function upload(file, moment) {
			var deferred = $q.defer();
			if(!moment.key.includes(".txt") && !moment.key.includes("_")) {
				moment.key = moment.key + "_" + new Date().getTime() + ".jpg";
			}
			if(verifyMetaData(moment)) {
				var key = splitUrlOff(moment.key);
				delete moment.key;
				awsServices.upload(file, key, moment).then(function() {
					deferred.resolve();
				},function(error) {
					error = "FAILURE - aws_services.upload" + "\r\n" + "FILE: " + file + " KEY: " + key + " | MOMENT: " + moment + "\r\n" + error;
					console.log("FAILURE IN aws_services.upload");
					console.log(error);
					core.logFile(error, 'errors.txt').then(function() {
						deferred.reject(error);	
					});
				});
			}
			else {
				deferred.reject("invalid MetaData");
			}
			return deferred.promise;
		};

		function getCurrentTime() {
			return new Date().getTime();
		};

		function timeElapsed(time) {
			if(time.match(/[a-z]/i)) { //It is already in the correct format
				return time;
			}
			time = parseInt(time);
			var currentTime = new Date().getTime();
			var minute = 60;
			var hour = 3600;
			var day = 86400;
			var counter = 0;
			var timeElapsed = Math.abs(currentTime - time);
			timeElapsed = timeElapsed / 1000;
		//How many days are in timeElasped?
		for(var i = timeElapsed; i > day; i = i - day) {
			counter++;
		}
		day = counter;
		counter = 0;
		if(day >= 1) {
			return day + "d";
		}

		for(var i = timeElapsed; i > hour; i = i - hour) {
			counter++;
		}
		hour = counter;
		counter = 0;
		if(hour >= 1) {
			return hour + "h";
		}

		for(var i = timeElapsed; i > minute; i = i - minute) {
			counter++;
		}
		minute = counter;
		counter = 0;
		if(minute >= 1) {
			return minute + "m";
		}
		else {
			return "0m"
		}
	};

	function initializeUserLocation() {
		var deferred = $q.defer();

		getCurrentLatLong().then(function(response) {
			var lat = response.lat;
			var lng = response.lng;
			getDeviceLocation(lat, lng).then(function(response) {
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

	function getCurrentLatLong() {
		var deferred = $q.defer();
		var posOptions = {timeout: 10000, enableHighAccuracy: false};
		$cordovaGeolocation.getCurrentPosition(posOptions)
		.then(function(position) {
			var lat = position.coords.latitude;
			var lng = position.coords.longitude;
			deferred.resolve({lat: lat, lng: lng});
		}, function(error) {
			error = "FAILURE - core.getCurrentLatLong" + "\r\n" + error;
			console.log("FAILURE IN core.getCurrentLatLong");
			console.log(error);
			logFile(error, 'logs.txt').then(function() {
				deferred.reject(error);	
			});
		});
		return deferred.promise;
	};

	function getDeviceLocation(lat, lng) {
		var deferred = $q.defer();
		var url = constants.GEOLOCATION_URL + lat + ',' + lng;

		$http.get(url).then(function(response) {
			// key = constants.MOMENT_PREFIX + response.data.results[6].formatted_address + '/' + key + '.jpeg';
			response = response.data.results[2].formatted_address;
			response = response.slice(0, response.lastIndexOf(','));
			response = response.replace(/[0-9]/g, '');
			deferred.resolve(response);
		}, function(error) {
			error = "FAILURE - core.getDeviceLocation" + "\r\n" + "LAT: " + lat + "| " + "LNG: " + lng + "\r\n" + error;
			console.log("FAILURE IN core.getDeviceLocation");
			console.log(error);
			logFile(error, 'logs.txt').then(function() {
				deferred.reject(error);	
			});
			deferred.reject(error);
		});
		return deferred.promise;
	};

//DEV MODE
function getHardCodedMoments() {
	var key = "test/PA/"
	var temp = [];
	return awsServices.getMoments(key).then(function(moments) {
		moments.splice(0,1);
		return Promise.all(moments.map(moment =>
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
	});
};

function getUUID() {
		// console.log("window.device.uuid");
		// console.log(window.device.uuid);
		// return window.device.uuid;
		return "123"; //Temporary
	};

};
})();