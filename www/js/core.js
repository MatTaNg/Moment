(function() {
	angular.module('core', [])

	.service('core', ['$cordovaGeolocation', '$http', '$q', '$ionicLoading', core]);

	function core($cordovaGeolocation, $http, $q, $ionicLoading){
		var vm = this;
		//Constants
		vm.max_description_length = 180;
		vm.hoursBetweenMoments = 12;
		vm.bestMomentsRatio = 0.5;

		bucketName = 'mng-moment',
		bucketRegion = 'us-east-1',
		key = 'AKIAIJTJGHYI2C7CYWDA',
		IdentityPoolId = 'us-east-1:9d3f5c80-78c8-4505-a52e-0d811dccc8e4',
		moment_prefix = 'test/',
		bestMoments_prefix = 'bestMoments/',
		feedback_prefix = 'reports/feedback/',
		bug_prefix = 'reports/bugs/',
		imageUrl = 'https://s3.amazonaws.com/' + bucketName + '/',
		momentArray = [],
		verifyMetaData = verifyMetaData,
		timeElapsed = timeElapsed,
		splitUrlOff = splitUrlOff;

		vm.getMomentPrefix = getMomentPrefix;
		vm.getBestMomentPrefix = getMomentPrefix;
		vm.getFeedbackPrefix = getFeedbackPrefix;
		vm.getBugPrefix = getBugPrefix;
		vm.getBucketName = getBucketName;
		vm.getBucketRegion = getBucketRegion;
		vm.getKey = getKey;
		vm.getCurrentTime = getCurrentTime;
		vm.getDeviceLocation = getDeviceLocation;
		vm.getCalculateDistance = calculateDistance;
		vm.getTownName = getTownName;
		vm.getUUID = getUUID;

		vm.initiateBucket = initiateBucket;
		vm.remove = remove;
		vm.edit = edit;
		vm.upload = upload;
		vm.initiateMoments = initiateMoments;
		vm.logFile = logFile;

		function getMomentPrefix() {
			return moment_prefix;
		};
		function getBestMomentPrefix() {
			return bestMoments_prefix;
		};
		function getFeedbackPrefix() {
			return feedback_prefix;
		};
		function getBugPrefix() {
			return bug_prefix;
		};
		function getBucketName() {
			return bucketName;
		};
		function getBucketRegion() {
			return bucketRegion;
		};
		function getKey() {
			return key;
		};
		function initiateBucket() {
			AWS.config.update({
				region: bucketRegion,
				credentials: new AWS.CognitoIdentityCredentials({
					IdentityPoolId: IdentityPoolId
				})
			});

			var s3 = new AWS.S3({
				apiVersion: '2006-03-01',
				params: {Bucket: bucketName}
			});

			return s3;
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
		Bucket: bucketName,
		Key: moment_prefix + imageLocation
	};
	var s3 = vm.initiateBucket();
	s3.deleteObject(params, function(error, data) {
		if(!error) {
			console.log("SUCCESS");
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
		metaData.description &&
		metaData.views &&
		metaData.uuids
		);
}

function edit(key, metaData){
	if(verifyMetaData(metaData)) {
		key = splitUrlOff(key);
		var s3 = vm.initiateBucket();
		var params = {
			Bucket: bucketName,
			CopySource: bucketName + '/' + key,
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
				logFile("Uploaded: " + file, 'logs.txt');
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
		Bucket: bucketName,
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
	if(key.includes('reports') || verifyMetaData(metaData)) {
		var s3 = vm.initiateBucket();
		uploadToBestMoments(file, key, metaData);
		// var key = moment_prefix + file.name;
		s3.upload({
			Key: key,
			Body: file,
			ACL: 'public-read',
			Metadata: metaData
		}, function(err, data) {
			if (err) {
				console.log(err.message);
				console.log("FILE: " + file);
				console.log("META: " + metaData)
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

	function getDeviceLocation() {
		return "Narberth, PA";
		// var posOptions = {timeout: 10000, enableHighAccuracy: false};
		// $cordovaGeolocation.getCurrentPosition(posOptions)
		// .then(function(position) {
		// 	console.log("SUCCESS");
		// 	return getTownName(latitude, longitude);
		// }, function(error) {
		// 	console.log("ERROR");
		// 	console.log(error.message);
		// });
};

function calculateDistance(lat1, lat2, long1, long2) {
		var R = 6371e3; // metres
		var φ1 = lat1.toRadians();
		var φ2 = lat2.toRadians();
		var Δφ = (lat2-lat1).toRadians();
		var Δλ = (long2-long1).toRadians();

		var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
		Math.cos(φ1) * Math.cos(φ2) *
		Math.sin(Δλ/2) * Math.sin(Δλ/2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

		var d = R * c;
		return d;
	};

	function getTownName(lat, lng) {
		alert("GET TOWN NAME");
		var url = 'https://civinfo-apis.herokuapp.com/civic/geolocation?latlng=' + lat + ',' + lng;
		$http.get(url).then(function(response) {
			if(response.data.results.length) {
				console.log("SUCCESS");
				console.log(response.data.results[0]);
				return response.data.results[0];
			}
			else {
				console.log("UNKNOWN LOCATION");
			}
		},
		function(error) {
			console.log("ERROR");
			console.log(error.message)
		});
	};

	function getUUID() {
		return "123"; //Temporary
	};

	function initiateMoments(prefix) {
		momentArray = [];
		var deferred = $q.defer();
		var s3 = vm.initiateBucket();
		var imageURL;
		var metaData;
		var params = {
			Bucket: bucketName,
			Prefix: prefix
		};
		$ionicLoading.show({
			template: '<ion-spinner></ion-spinner>'
		});
		s3.listObjectsV2(params, function(error, data) {
			if (error) {
				console.log("ERROR");
				console.log(error.stack);
				deferred.reject(error);
			}
			else {
				$ionicLoading.hide();
				var tempImageArray = [];
				for(var i = 0; i < data.Contents.length; i++) {
				//Push all images from the DB onto an array.  We filter them later.
				if(i > 0) //The first key listed is always the folder, skip that.
					tempImageArray.push(data.Contents[i].Key);
			}
			for(var x = 0; x < tempImageArray.length; x++) {
				(function(x) {
					var params = {
						Bucket: bucketName,
						Key: tempImageArray[x]
					};
					s3.headObject(params, function(error, data) {
						if(error) {
							console.log("ERROR");
							console.log(error.stack);
							deferred.reject(error);
						}
						else {
							var time = timeElapsed(data.Metadata.time);
							momentArray.push({ 
								key: imageUrl + tempImageArray[x], 
								description: data.Metadata.description,
								likes: data.Metadata.likes,
								location: data.Metadata.location,
								time: time,
								uuids: data.Metadata.uuids,
								views: data.Metadata.views
							});
							if(momentArray.length === tempImageArray.length) {
								deferred.resolve(momentArray);
							}
						}
					});
				})(x);
			} //End of second for loop
			if(tempImageArray.length === 0)
				deferred.resolve(tempImageArray);
		}
	}); //End of listObjects
return deferred.promise;

};
};
})();