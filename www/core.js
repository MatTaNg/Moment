angular.module('core', [])

.service('coreSvc', ['$cordovaGeolocation', function($cordovaGeolocation){
	var bucketName = 'mng-moment';
	var bucketRegion = 'us-east-1';
	var key = 'AKIAIJTJGHYI2C7CYWDA';
	var IdentityPoolId = 'us-east-1:9d3f5c80-78c8-4505-a52e-0d811dccc8e4';

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
			}
			else {
				console.log(error.stack);
			}
		})
	};

	this.getDeviceLocation = function() {
		var posOptions = {timeout: 10000, enableHighAccuracy: false};
		$cordovaGeolocation.getCurrentPosition(posOptions)
		.then(function(position) {
			var latitude = position.coords.latitude;
			var longitude = position.coords.longitude;
			alert(latitude);
			alert(longitude);
			return getTownName(latitude, longitude);
		}, function(error) {
			alert(error.message);
			console.log("ERROR");
			console.log(error.message);
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

	this.getTownName = function(lat, long) {
		alert("Get Town Name");
		var geocoder;
		geocoder = new google.maps.Geocoder();
		var latlng = new google.maps.LatLng(lat, long);

		geocoder.geocode(
			{'latLng': latlng}, 
			function(results, status) {
				alert("Function");
				if (status == google.maps.GeocoderStatus.OK) {
					if (results[0]) {
						var add= results[0].formatted_address ;
						var  value=add.split(",");

						count=value.length;
						country=value[count-1];
						state=value[count-2];
						city=value[count-3];
						alert("city name is: " + city);
						return city;
					}
					else  {
						alert("address not found");
					}
				}
				else {
					alert("Geocoder failed due to: " + status);
				}
			}
			);
	};

	this.getUUID = function() {
		return 123; //Temporary
	};
}])