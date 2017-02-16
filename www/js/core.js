angular.module('core', [])

.service('coreSvc', ['$cordovaGeolocation', '$http', '$q', '$ionicLoading', function($cordovaGeolocation, $http, $q, $ionicLoading){
	this.max_description_length = 180;
	var bucketName = 'mng-moment';
	var bucketRegion = 'us-east-1';
	var key = 'AKIAIJTJGHYI2C7CYWDA';
	var IdentityPoolId = 'us-east-1:9d3f5c80-78c8-4505-a52e-0d811dccc8e4';
	var moment_prefix = 'test/';
	var bestMoments_prefix = 'bestMoments/';
	var feedback_prefix = 'reports/feedback/';
	var bug_prefix = 'reports/bugs/';
	var imageUrl = 'https://s3.amazonaws.com/' + bucketName + '/';
	var momentArray = [];

	var splitUrlOff = function(key) {
		var result = "";
		var keySplit = key.split('/');
		if(keySplit.length > 4) {
			for(var i = 4; i < keySplit.length; i++) {
				result = result + keySplit[i] + '/';
			}
			return result.substring(0, result.length-1);
		}
		return key;
	}

	this.getMomentPrefix = function() {
		return moment_prefix;
	};
	this.getBestMomentPrefix = function() {
		return bestMoments_prefix;
	};
	this.getFeedbackPrefix = function() {
		return feedback_prefix;
	};
	this.getBugPrefix = function() {
		return bug_prefix;
	};
	this.getBucketName = function() {
		return bucketName;
	};
	this.getBucketRegion = function() {
		return bucketRegion;
	};
	this.getKey = function() {
		return key;
	}
	this.initiateBucket = function() {
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

//Doesnt Work
this.delete = function(imageLocation) {
	var params = {
		Bucket: bucketName,
		Key: moment_prefix + imageLocation
	};
	var s3 = this.initiateBucket();
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

this.edit = function(key, metaData){
	key = splitUrlOff(key);
	var s3 = this.initiateBucket();
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
  			}
  			else {
  				console.log(data);           // successful response
  			}
  		});
};

this.upload = function(file, key, metaData) {
	var s3 = this.initiateBucket();
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
			}
			else {
				console.log("Successfully Uploaded to S3");
			}
		});
	};

	this.getCurrentTime = function() {
		return new Date().getTime();
	};

	var timeElapsed = function(time) {
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

	this.getDeviceLocation = function() {
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

this.calculateDistance = function(lat1, lat2, long1, long2) {
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

	this.getTownName = function(lat, lng) {
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

	this.getUUID = function() {
		return "123"; //Temporary
	};

	this.initiateMoments = function(prefix) {
		momentArray = [];
		var deferred = $q.defer();
		var s3 = this.initiateBucket();
		var imageURL;
		var metaData;
		var params = {
			Bucket: bucketName,
			Prefix: prefix
		};
		$ionicLoading.show({
			template: 'Retrieving Data... <ion-spinner></ion-spinner>'
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
}])