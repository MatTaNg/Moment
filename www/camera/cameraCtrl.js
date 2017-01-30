angular.module('app.cameraCtrl', [])

.controller('cameraCtrl', ['$scope', '$stateParams', '$state', '$q', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state, $q) {

	var screenWidth = window.screen.width;
	var screenHeight = window.screen.height * 0.5;
	$scope.momentPicture = document.getElementById('momentPicture');
	var albumBucketName = 'mng-moment';
	var bucketRegion = 'us-east-1';
	var IdentityPoolId = 'us-east-1:9d3f5c80-78c8-4505-a52e-0d811dccc8e4';

	AWS.config.update({
		region: bucketRegion,
		credentials: new AWS.CognitoIdentityCredentials({
			IdentityPoolId: IdentityPoolId
		})
	});

	var s3 = new AWS.S3({
		apiVersion: '2006-03-01',
		params: {Bucket: albumBucketName}
	});

	$scope.camera = function() { 
		console.log("CAMERA");
		console.log(screenWidth);
		console.log(screenHeight);
		navigator.camera.getPicture(onSuccess, onFail, 
			{ quality: 100, //Quality of photo 0-100
			destinationType: Camera.DestinationType.DATA_URL, //File format, recommended FILE_URL
			allowEdit: false,	//Allows editing of picture
			targetWidth: screenWidth,
			targetHeight: screenHeight,
			correctOrientation: true
		});

		function onSuccess(imageURI) {
			console.log("Success");
			var picture = "data:image/jpeg;base64," + imageURI;
			$scope.momentPicture = document.getElementById('momentPicture');
			$scope.momentPicture.src = picture;
			$state.go('textOverlay', {'picture': picture});
		};

		function onFail(message) {
			console.log('Failed because: ' + message);
		}
	};

	$scope.gallery = function() {
		$scope.addPhoto('img/test.jpg');

		navigator.camera.getPicture(onSuccess, onFail, {
			quality: 100, //Quality of photo 0-100
			destinationType: Camera.DestinationType.DATA_URL, //File format, recommended FILE_URL
			sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
			allowEdit: false,	//Allows editing of picture
			targetWidth: 300,
			targetHeight: 300,
			correctOrientation: true
		});

		function onSuccess(imageURI) {
			var picture = "data:image/jpeg;base64," + imageURI;
			$scope.momentPicture = document.getElementById('momentPicture');
			$scope.momentPicture.src = picture;
			console.log(imageURI);
			// $state.go('textOverlay', {'picture': imageURI});
		}

		function onFail(message) {
			console.log("Failed because: " + message);
		}
	};

	$scope.addPhoto = function(albumName) {
		console.log("Add Photo");
		console.log(albumName);
		var albumPhotosKey = encodeURIComponent(albumName) + '/test.jpg/';
		console.log("albumPhotosKey");
		console.log(albumPhotosKey);

		var photoKey = albumPhotosKey;
		s3.upload({
			Key: photoKey,
			Body: albumName,
			ACL: 'public-read'
		}, function(err, data) {
			if (err) {
				return alert('There was an error uploading your photo: ', err.message);
			}
			alert('Successfully uploaded photo.');
			console.log(data);
		});
	};

}])
