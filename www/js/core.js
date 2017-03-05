(function() {
	angular.module('core', [])

	.service('core', ['$cordovaGeolocation', '$q', '$http', 'constants', core]);

	function core($cordovaGeolocation, $q, $http, constants){
		var vm = this;

		var moment_radius_in_miles = 25,
		lat_mile_radius = 0.016880283 * moment_radius_in_miles, //1 mile distance between two points * perferred radius
		lng_mile_radius = 0.019158007 * moment_radius_in_miles, //1 mile distance between two points * perferred radius

		verifyMetaData = verifyMetaData,
		splitUrlOff = splitUrlOff;

		vm.userLocation = {lat: "lat", lng: "lng", town: "town", state: "state"};

		vm.initializeUserLocation = initializeUserLocation,
		vm.timeElapsed = timeElapsed,
		vm.getCurrentTime = getCurrentTime;
		vm.getCurrentLatLong = getCurrentLatLong;
		vm.getUUID = getUUID;
		vm.getLatMileRadius = getLatMileRadius;
		vm.getLngMileRadius = getLngMileRadius;
		vm.getDeviceLocation = getDeviceLocation;

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

//Doesnt Work
function remove(imageLocation) {
	var params = {
		Bucket: constants.BUCKET_NAME,
		Key: constants.MOMENT_PREFIX + imageLocation
	};
	var s3 = vm.initiateBucket();
	s3.deleteObject(params, function(error, data) {
		if(!error) {
			console.log(data.DeleteMarker());
			console.log("PATH: " + imagePath);
		}
		else {
			console.log("ERROR");
			console.log(error.stack);
		}
	})
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

function edit(key, metaData){
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
  				console.log("KEY: " + key);
  				console.log("META: " + metaData)
  				return false;
  			}
  			else {
  				console.log(data);           // successful response
  				return true;
  			}
  		});
	}
	else {
		console.log("Invalid MetaData");
		console.log(metaData);
		return false;
	}
};

function uploadToBestMoments(file, key, metaData) {
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
				return false;
			}
			else {
				logFile("Uploaded to Best Moments: " + file, 'logs.txt');
				console.log("Successfully Uploaded to S3");
				return true;
			}
		});
	}
};

function logFile(message, key) {
	var s3 = vm.initiateBucket();
	var key = 'reports/' + key;
	var params = {
		Bucket: constants.BUCKET_NAME,
		Key: key
	};
	s3.getObject(params, function(error, data) {
		if(error) {
			console.log(error, error.stack);
		}
		else {
			message = Date() + ': ' + message + "\r\n" + data.Body.toString();
			var blob = new Blob([message], {type: "text"});
			var file =  new File([blob], key);
			if(vm.upload(file, key, {})) {
				return true;
			}
			else {
				return false;
			}
		}
	});
};

function upload(file, key, metaData) {
	console.log("KEY");
	console.log(key);
	if(verifyMetaData(metaData)) {
		var s3 = vm.initiateBucket();
		console.log(s3);
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
				return false;
			}
			else {
				console.log("Successfully Uploaded to S3");
				return true;
			}
		});
	}
	else {
		console.log("Invalid MetaData");
		console.log(metaData);
		return false;
	}
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
	var timeElapsed = currentTime - time;
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
		var url = 'https://civinfo-apis.herokuapp.com/civic/geolocation?latlng=' + lat + ',' + lng;

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