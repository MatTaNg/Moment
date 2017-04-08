 (function() {
 	angular.module('core', [])

 	.service('core', ['$cordovaGeolocation', '$q', '$http', 'constants', 'awsServices', core]);

 	function core($cordovaGeolocation, $q, $http, constants, awsServices){
 		var vm = this,
 		deferred = $q.defer();

 		var moment_radius_in_miles = 25,
		lat_mile_radius = 0.016880283 * moment_radius_in_miles, //1 mile distance between two points * perferred radius
		lng_mile_radius = 0.019158007 * moment_radius_in_miles, //1 mile distance between two points * perferred radius

		verifyMetaData = verifyMetaData,
		splitUrlOff = splitUrlOff;

		vm.userLocation = {lat: "lat", lng: "lng", town: "town", state: "state"};
		vm.moments = [];

		vm.initializeUserLocation = initializeUserLocation,
		vm.timeElapsed = timeElapsed,
		vm.getCurrentTime = getCurrentTime;
		vm.getCurrentLatLong = getCurrentLatLong;
		vm.getUUID = getUUID;
		vm.getLatMileRadius = getLatMileRadius;
		vm.getLngMileRadius = getLngMileRadius;
		vm.getDeviceLocation = getDeviceLocation;
		vm.checkAndDeleteExpiredMoment = checkAndDeleteExpiredMoment;

		vm.initiateBucket = initiateBucket;
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
		}

		function initiateBucket() {
			var albumBucketName = 'mng-moment';
			var bucketRegion = 'us-east-1';
			var IdentityPoolId = 'us-east-1:9d3f5c80-78c8-4505-a52e-0d811dccc8e4';

			AWS.config.update({
				region: bucketRegion,
				credentials: new AWS.CognitoIdentityCredentials({
					IdentityPoolId: IdentityPoolId
				})
			});

			return new AWS.S3({
				apiVersion: '2006-03-01',
				params: {Bucket: albumBucketName}
			});
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
			return key;
		};

		function getImagePath(imageLocation) {
			var result = imageLocation.split('/');
			result = result[4] + '/' + result[5] + '/' + result[6]
			return result;
		};

function remove(imageLocation) {
	var imagePath = getImagePath(imageLocation);
	var deferred = $q.defer();
	var params = {
		Bucket: constants.BUCKET_NAME,
		Key: imagePath
	};
	var s3 = vm.initiateBucket();
	s3.deleteObject(params, function(error, data) {
		if(!error) {
			deferred.resolve();
		}
		else {
			console.log("ERROR");
			console.log(error.stack);
			deferred.reject(error);
		}
	})
	return deferred.promise;
};

var verifyMetaData = function(metaData) {
	return (
		metaData.location &&
		metaData.likes &&
		metaData.description !== undefined &&
		metaData.time &&
		metaData.views &&
		metaData.uuids
		);
}

function checkAndDeleteExpiredMoment(moment) {
	var likes = moment.likes,
		view = moment.views,
		currentTime = new Date().getTime(),
		timeElapsed = moment.timeElapsed,
		miliseconds_in_a_day = 86400000;
	if(currentTime - miliseconds_in_a_day > timeElapsed) {
		remove(moment.key);
	}

};

function edit(key, metaData){
	var deferred = $q.defer();
	delete metaData["swipedRight"];
	delete metaData["swipedLeft"];
	//Angular puts attributes on our object to track it.  Delete it.
	delete metaData["$$hashkey"];
	delete metaData["class"];

	if(verifyMetaData(metaData)) {
		key = splitUrlOff(key);
		var s3 = vm.initiateBucket();
		var params = {
			Bucket: constants.BUCKET_NAME,
			CopySource: constants.BUCKET_NAME + '/' + key,
			Key: key,
			Metadata: metaData,
			MetadataDirective: "REPLACE"
		};

		s3.copyObject(params, function(err, data) {
			if (err) {
  				console.log(err, err.stack); // an error occurred
  				console.log("KEY:");
  				console.log(key);
  				console.log("META:");
  				console.log(metaData);
  				deferred.reject();
  			}
  			else {
  				deferred.resolve();
  			}
  		});
	}
	else {
		console.log("Invalid MetaData");
		console.log(metaData);
		deferred.reject();
	}
	return deferred.promise;
};

function uploadToBestMoments(file, key, metaData) {
	var deferred = $q.defer();
	var s3 = vm.initiateBucket();
	if(metaData.likes / metaData.views > vm.bestMomentsRatio) {
		s3.upload({
			Key: key,
			Body: file,
			ACL: 'public-read',
			Metadata: metaData
		}, function(err, data) {
			if (err) {
				logFile("ERROR: " + err.message, 'logs.txt');
				console.log(err.message);
				console.log("FILE: " + file);
				console.log("META: " + metaData)
				deferred.reject();
			}
			else {
				logFile("Uploaded to Best Moments: " + file, 'logs.txt');
				console.log("Successfully Uploaded to S3");
				deferred.resolve();
			}
		});
	}
	return deferred.promise;
};

function logFile(message, key) {
	var deferred = $q.defer();
	var s3 = vm.initiateBucket();
	var key = 'reports/' + key;
	var params = {
		Bucket: constants.BUCKET_NAME,
		Key: key
	};
	s3.getObject(params, function(error, data) {
		if(error) {
			console.log(error, error.stack);
			deferred.reject();
		}
		else {
			message = Date() + ': ' + message + "\r\n" + data.Body.toString();
			var blob = new Blob([message], {type: "text"});
			var file =  new File([blob], key);
			vm.upload(file, key, {}).then(function() {
				deferred.resolve();
			}, function(error) {
				deferred.reject();
			});
		}
	});
	return deferred.promise;
};

function upload(file, key, metaData) {
	var deferred = $q.defer();
	if(!key.includes(".txt") && !key.includes("_")) {
		key = key + "_" + new Date().getTime() + ".jpg";
	}
	if(verifyMetaData(metaData) || key.includes('reports')) {
		var s3 = vm.initiateBucket();
		// uploadToBestMoments(file, key, metaData);
		// var key = moment_prefix + file.name;
		s3.upload({
			Key: key,
			Body: file,
			ACL: 'public-read',
			Metadata: metaData
		}, function(err, data) {
			if (err) {
				console.log(err.message);
				deferred.reject(err);
			}
			else {
				console.log("Successfully Uploaded to S3");
				deferred.resolve();
			}
		});
	}
	else {
		console.log("Invalid MetaData");
		console.log(metaData);
		deferred.reject("invalid MetaData");
	}
	return deferred.promise;
};

function getCurrentTime() {
	return new Date().getTime();
};

function timeElapsed(time) {
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
			console.log("HOURS");
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
			console.log("MINS");
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
			console.log("ERROR");
			console.log(error.message);
			deferred.reject(error.message)
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

	      // var url = 'https://civinfo-apis.herokuapp.com/civic/geolocation?latlng=' + lat + ',' + lng;
	      deferred.resolve({lat: lat, lng: lng});
	  }, function(error) {
	  	deferred.reject(error);
	  	console.log("ERROR");
	  	console.log(error.message);
	  });
		return deferred.promise;
	};

	function getDeviceLocation(lat, lng) {
		var deferred = $q.defer();
		var url = CONSTANTS.GEOLOCATION_URL + lat + ',' + lng;

		$http.get(url).then(function(response) {
			// key = constants.MOMENT_PREFIX + response.data.results[6].formatted_address + '/' + key + '.jpeg';
			response = response.data.results[2].formatted_address;
			response = response.slice(0, response.lastIndexOf(','));
			response = response.replace(/[0-9]/g, '');
			deferred.resolve(response);
		}, function(error) {
			deferred.reject(error);
		});
		return deferred.promise;
	};

	function getUUID() {
		return "123"; //Temporary
	};

};
})();