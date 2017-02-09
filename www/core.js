angular.module('core', [])

.service('coreSvc', ['$cordovaGeolocation', '$http', function($cordovaGeolocation, $http){
	var bucketName = 'mng-moment';
	var bucketRegion = 'us-east-1';
	var key = 'AKIAIJTJGHYI2C7CYWDA';
	var IdentityPoolId = 'us-east-1:9d3f5c80-78c8-4505-a52e-0d811dccc8e4';

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

	this.delete = function(imagePath) {
		var params = {
			Bucket: bucketName,
			Key: imagePath
		};
		var s3 = this.initiateBucket();
		s3.deleteObject(params, function(error, data) {
			if(!error) {
				console.log(data);
				console.log("PATH: " + imagePath);
			}
			else {
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

	this.upload = function(file, metaData) {
		var s3 = this.initiateBucket();
		var key = 'test/' + file.name;
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

	this.getDeviceLocation = function() {
		var posOptions = {timeout: 10000, enableHighAccuracy: false};
		$cordovaGeolocation.getCurrentPosition(posOptions)
		.then(function(position) {
			console.log("SUCCESS");
			return getTownName(latitude, longitude);
		}, function(error) {
			console.log("ERROR");
			alert(error.message);
		});
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
}])